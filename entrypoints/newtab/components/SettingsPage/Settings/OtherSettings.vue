<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core'

import {
  CloudOffRound,
  DeleteForeverOutlined,
  DownloadRound,
  FileUploadRound
} from '@vicons/material'
import { ElLoading } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import localForage from 'localforage'

import { storage } from '#imports'

import { downloadJSON } from '@/shared/getJson'
import { type CURRENT_CONFIG_INTERFACE, defaultSettings, useSettingsStore } from '@/shared/settings'
import { saveShortcut, type Shortcut, useShortcutStore } from '@/shared/shortcut'
import { deinitSyncSettings, initSyncSettings } from '@/shared/sync'

import {
  type CustomSearchEngineStorage,
  saveCustomSearchEngine,
  useCustomSearchEngineStore
} from '@newtab/shared/customSearchEngine'

const { t, i18next } = useTranslation('settings')

const settings = useSettingsStore()
const shortcuts = useShortcutStore()
const customSearchEngineStore = useCustomSearchEngineStore()

async function confirmClearExtensionData() {
  try {
    await ElMessageBox.confirm(
      t('other.confirmPurgeData.message'),
      t('other.confirmPurgeData.title'),
      {
        confirmButtonText: t('newtab:common.confirm'),
        cancelButtonText: t('newtab:common.no'),
        type: 'warning'
      }
    )
  } catch {
    return
  }

  clearExtensionData()
}

async function confirmClearWallpaperData() {
  try {
    await ElMessageBox.confirm(
      t('other.confirmPurgeWallpaper.message'),
      t('other.confirmPurgeWallpaper.title'),
      {
        confirmButtonText: t('newtab:common.confirm'),
        cancelButtonText: t('newtab:common.no'),
        type: 'warning'
      }
    )
  } catch {
    return
  }

  clearWallpaperData()
}

async function clearWallpaperData() {
  const resetSettings = () => {
    settings.background.bgType = defaultSettings.background.bgType
    settings.background.local = { ...defaultSettings.background.local }
    settings.background.localDark = { ...defaultSettings.background.localDark }
    settings.background.bing = { ...defaultSettings.background.bing }
  }

  ElLoading.service({
    lock: true,
    text: t('other.confirmPurgeWallpaper.purging'),
    body: true,
    background: 'var(--el-overlay-color-light)'
  })

  Promise.all([resetSettings(), localForage.dropInstance({ name: '柠檬起始页' })])
    .catch(console.error)
    .finally(() => {
      setTimeout(() => {
        location.reload()
      }, 1000)
    })
}

function clearExtensionData() {
  ElLoading.service({
    lock: true,
    text: t('other.confirmPurgeData.purging'),
    body: true,
    background: 'var(--el-overlay-color-light)'
  })

  Promise.all([
    localStorage.clear(),
    sessionStorage.clear(),
    localForage.dropInstance({ name: '柠檬起始页' }),
    storage.clear('local'),
    storage.clear('session'),
    storage.clear('sync')
  ])
    .catch(console.error)
    .finally(() => {
      useTimeoutFn(() => {
        location.reload()
      }, 1000)
    })
}

function sendSyncMessage() {
  if (settings.sync.enabled) {
    initSyncSettings(settings)
  } else {
    deinitSyncSettings()
  }
}

const fileInput = useTemplateRef('fileInput')
type Backup = {
  settings: CURRENT_CONFIG_INTERFACE
  shortcuts: Shortcut
  customSearchEngines: CustomSearchEngineStorage
}

/**
 * 通用文件选择器打开函数
 */
async function openFilePicker() {
  try {
    await ElMessageBox.confirm(
      t('other.importExport.warningDialog.content'),
      t('other.importExport.warningDialog.title'),
      {
        confirmButtonText: t('other.importExport.warningDialog.yes'),
        cancelButtonText: t('other.importExport.warningDialog.no'),
        type: 'warning'
      }
    )
    fileInput.value?.click()
  } catch {}
}

async function exportBackup() {
  const backup: Backup = {
    settings: settings.$state,
    shortcuts: shortcuts.$state,
    customSearchEngines: customSearchEngineStore.$state
  }

  downloadJSON<Backup>(backup, 'lenmon-new-tab-backup.json')
}

function backupValidator(data: unknown): data is Backup {
  if (typeof data !== 'object' || data === null) return false
  if ('settings' in data && typeof data.settings === 'object' && data.settings !== null) return true
  if ('shortcuts' in data && typeof data.shortcuts === 'object' && data.shortcuts !== null)
    return true
  if (
    'customSearchEngines' in data &&
    typeof data.customSearchEngines === 'object' &&
    data.customSearchEngines !== null
  )
    return true
  return false
}

function handleFileChange(event: Event) {
  return handleFileImport<Backup>(event, fileInput, backupValidator, async (data) => {
    // settings 部分（沿用之前的逻辑）
    if (settings.version !== data.settings.version) {
      ElMessage.error(
        t('other.importExport.importFailed', { reason: t('other.importExport.versionMismatch') })
      )
      return
    }

    const originalSyncState = settings.$state.sync.enabled

    data.settings.background.local = settings.$state.background.local
    data.settings.background.localDark = data.settings.background.localDark || {
      id: '',
      url: '',
      mediaType: undefined
    }
    data.settings.background.bing = settings.$state.background.bing
    data.settings.background.online.url = settings.$state.background.online.url

    settings.$patch(data.settings)
    if (originalSyncState !== data.settings.sync.enabled) {
      if (data.settings.sync.enabled) {
        initSyncSettings(settings)
      } else {
        deinitSyncSettings()
      }
    }

    // shortcuts 部分
    if (data.shortcuts) {
      shortcuts.$patch(data.shortcuts)
      await saveShortcut(data.shortcuts)
    }

    // custom search engines 部分
    if (data.customSearchEngines) {
      customSearchEngineStore.$patch(data.customSearchEngines)
      await saveCustomSearchEngine(data.customSearchEngines)
    }

    if (settings.sync.enabled) {
      initSyncSettings(settings)
    }
  })
}

/**
 * 通用文件导入处理函数
 */
function handleFileImport<T>(
  event: Event,
  inputRef: Ref<HTMLInputElement | null>,
  validator: (data: unknown) => data is T,
  onSuccess: (data: T) => void
) {
  const input = event.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) {
    ElMessage.error(
      t('other.importExport.importFailed', { reason: t('other.importExport.noFileSelected') })
    )
    console.error('No file selected')
    return
  }

  const reader = new FileReader()
  let fileContent: T | null = null
  let parseError: string | null = null

  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result as string)
      if (validator(json)) {
        fileContent = json
      } else {
        parseError = t('other.importExport.invalidFileFormat')
        ElMessage.error(t('other.importExport.importFailed', { reason: parseError }))
      }
    } catch {
      parseError = t('other.importExport.invalidJSON')
      ElMessage.error(t('other.importExport.importFailed', { reason: parseError }))
    }
  }

  reader.readAsText(file)
  return new Promise<void>((resolve) => {
    reader.onloadend = () => {
      if (fileContent) {
        onSuccess(fileContent)
        ElMessage.success(t('other.importExport.importSuccess'))
      } else {
        ElMessage.error(
          t('other.importExport.importFailed', {
            reason: parseError || t('other.importExport.unknownError')
          })
        )
      }
      // 重置 file input 以允许导入同一个文件
      if (inputRef.value) inputRef.value.value = ''
      resolve()
    }
  })
}

const currentLanguage = ref(i18next.language)

const supportedLanguages = computed(() => {
  const locale = currentLanguage.value || navigator.language
  const displayNames = new Intl.DisplayNames([locale], { type: 'language' })

  const languageCodes = ['zh-CN', 'zh-TW', 'zh-HK', 'en']
  const current = currentLanguage.value

  // 先添加当前语言，再添加其他语言
  const options = languageCodes.map((code) => ({
    value: code,
    label: displayNames.of(code)
  }))
  // 将当前语言移到首位
  const currentIndex = options.findIndex((opt) => opt.value === current)
  if (currentIndex > 0) {
    options.unshift(options.splice(currentIndex, 1)[0]!)
  }
  return options
})

function changeLanguage(lang: string) {
  i18next.changeLanguage(lang)
  currentLanguage.value = lang
}
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('other.sync') }}</div>
      <el-switch v-model="settings.sync.enabled" @change="sendSyncMessage" />
    </div>
    <p class="settings__item--note">
      {{ t('other.syncWarning') }}
      <cloud-off-round />
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:changelog.hideMajor') }}</div>
      <el-switch v-model="settings.hideMajorChangelog" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('other.language') }}</div>
      <el-select
        v-model="currentLanguage"
        style="width: 183px"
        popper-class="settings-item-popper"
        @change="changeLanguage"
        :show-arrow="false"
        fit-input-width
      >
        <el-option
          v-for="item in supportedLanguages"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('other.importExport.backup') }}</div>
      <span class="button-group">
        <el-button type="primary" :icon="DownloadRound" @click="exportBackup">
          {{ t('other.importExport.export') }}
        </el-button>
        <el-button :icon="FileUploadRound" @click="openFilePicker">
          {{ t('other.importExport.import') }}
        </el-button>
      </span>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('other.purgeWallpaperData') }}</div>
      <el-button type="danger" :icon="DeleteForeverOutlined" @click="confirmClearWallpaperData">
        {{ t('other.purge') }}
      </el-button>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('other.purgeData') }}</div>
      <el-button type="danger" :icon="DeleteForeverOutlined" @click="confirmClearExtensionData">
        {{ t('other.purge') }}
      </el-button>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>
