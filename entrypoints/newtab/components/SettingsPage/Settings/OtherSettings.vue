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
import { storage } from 'wxt/utils/storage'

import { type CURRENT_CONFIG_INTERFACE, defaultSettings, useSettingsStore } from '@/shared/settings'
import { saveShortcut, type Shortcut, useShortcutStore } from '@/shared/shortcut'
import { deinitSyncSettings, initSyncSettings } from '@/shared/sync'

import {
  type CustomSearchEngineStorage,
  saveCustomSearchEngine,
  useCustomSearchEngineStore
} from '@newtab/shared/customSearchEngine'
import { downloadJSON } from '@newtab/shared/getJson'
import {
  useBingWallpaperStorge,
  useDarkWallpaperStorge,
  useWallpaperStorge
} from '@newtab/shared/wallpaper'

const { t, i18next } = useTranslation('settings')

const isGoogleChrome = import.meta.env.CHROME && !import.meta.env.EDGE
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
        cancelButtonText: t('newtab:common.cancel'),
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
        cancelButtonText: t('newtab:common.cancel'),
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
    settings.localBackground = { ...defaultSettings.localBackground }
    settings.localDarkBackground = { ...defaultSettings.localDarkBackground }
    settings.bingBackground = { ...defaultSettings.bingBackground }
  }

  ElLoading.service({
    lock: true,
    text: t('other.confirmPurgeWallpaper.purging'),
    body: true,
    background: 'var(--el-overlay-color-light)'
  })

  Promise.all([
    resetSettings(),
    useWallpaperStorge.clear(),
    useDarkWallpaperStorge.clear(),
    useBingWallpaperStorge.clear()
  ])
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
    useWallpaperStorge.clear(),
    useDarkWallpaperStorge.clear(),
    useBingWallpaperStorge.clear(),
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

const settingsFileInput = ref<HTMLInputElement | null>(null)
const shortcutFileInput = ref<HTMLInputElement | null>(null)
const customSearchEngineFileInput = ref<HTMLInputElement | null>(null)

/**
 * 通用文件选择器打开函数
 */
async function openFilePicker(inputRef: Ref<HTMLInputElement | null>) {
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
    inputRef.value?.click()
  } catch {}
}

async function openSettingsFilePicker() {
  await openFilePicker(settingsFileInput)
}

async function openShortcutFilePicker() {
  await openFilePicker(shortcutFileInput)
}

async function openCustomSearchEngineFilePicker() {
  await openFilePicker(customSearchEngineFileInput)
}

async function exportSettings() {
  downloadJSON<CURRENT_CONFIG_INTERFACE>(settings.$state, 'lemon-tab-page-settings.json')
}

async function exportShortcuts() {
  downloadJSON<Shortcut>(shortcuts.$state, 'lemon-tab-page-shortcuts.json')
}

async function exportCustomSearchEngines() {
  downloadJSON<CustomSearchEngineStorage>(
    customSearchEngineStore.$state,
    'lemon-tab-page-custom-search-engines.json'
  )
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

function handleSettingsFileChange(event: Event) {
  return handleFileImport<CURRENT_CONFIG_INTERFACE>(
    event,
    settingsFileInput,
    (data): data is CURRENT_CONFIG_INTERFACE => typeof data === 'object' && data !== null,
    (data) => {
      const originalSyncState = settings.sync.enabled
      settings.$patch(data)
      if (originalSyncState !== settings.sync.enabled) {
        // 如果同步状态有变化，重新初始化或取消同步
        if (settings.sync.enabled) {
          initSyncSettings(settings)
        } else {
          deinitSyncSettings()
        }
      }
    }
  )
}

function storageValidator<T>(data: unknown): data is T {
  return typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)
}

function handleShortcutFileChange(event: Event) {
  return handleFileImport<Shortcut>(
    event,
    shortcutFileInput,
    storageValidator<Shortcut>,
    async (data) => {
      shortcuts.$patch(data)
      await saveShortcut(data)
      if (settings.sync.enabled) {
        initSyncSettings(settings)
      }
    }
  )
}

function handleCustomSearchEngineFileChange(event: Event) {
  return handleFileImport<CustomSearchEngineStorage>(
    event,
    customSearchEngineFileInput,
    storageValidator<CustomSearchEngineStorage>,
    async (data) => {
      customSearchEngineStore.$patch(data)
      await saveCustomSearchEngine(data)
      if (settings.sync.enabled) {
        initSyncSettings(settings)
      }
    }
  )
}

const currentLanguage = ref(i18next.language)

const supportedLanguages = computed(() => {
  const locale = currentLanguage.value || navigator.language
  const displayNames = new Intl.DisplayNames([locale], { type: 'language' })

  const languageCodes = ['zh-CN', 'zh-TW', 'zh-HK', 'en']
  const current = currentLanguage.value

  // 先添加当前语言，再添加其他语言
  return [current, ...languageCodes.filter((code) => code !== current)].map((code) => ({
    value: code,
    label: displayNames.of(code)
  }))
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
      <div class="settings__label">{{ t('newtab:changelog.hideMajorChangelog') }}</div>
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
      <div class="settings__label">{{ t('other.importExport.settings') }}</div>
      <span>
        <el-button type="primary" :icon="DownloadRound" @click="exportSettings">
          {{ t('other.importExport.export') }}
        </el-button>
        <el-button :icon="FileUploadRound" @click="openSettingsFilePicker">
          {{ t('other.importExport.import') }}
        </el-button>
      </span>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('other.importExport.shortcuts') }}</div>
      <span>
        <el-button type="primary" :icon="DownloadRound" @click="exportShortcuts">
          {{ t('other.importExport.export') }}
        </el-button>
        <el-button :icon="FileUploadRound" @click="openShortcutFilePicker">
          {{ t('other.importExport.import') }}
        </el-button>
      </span>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('other.importExport.customSearchEngines') }}</div>
      <span>
        <el-button type="primary" :icon="DownloadRound" @click="exportCustomSearchEngines">
          {{ t('other.importExport.export') }}
        </el-button>
        <el-button :icon="FileUploadRound" @click="openCustomSearchEngineFilePicker">
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
    <div v-if="isGoogleChrome" class="settings__item">
      <div class="settings__label" style="min-height: 32px">
        {{ t('other.want_to_customize_chrome') }}
      </div>
      <p class="settings__item--note">
        {{ t('other.customize_chrome_tips') }}
      </p>
    </div>
    <!-- 隐藏的设置导入按钮 -->
    <input
      ref="settingsFileInput"
      type="file"
      accept="application/json"
      style="display: none"
      @change="handleSettingsFileChange"
    />
    <!-- 隐藏的书签导入按钮 -->
    <input
      ref="shortcutFileInput"
      type="file"
      accept="application/json"
      style="display: none"
      @change="handleShortcutFileChange"
    />
    <!-- 隐藏的自定义搜索引擎导入按钮 -->
    <input
      ref="customSearchEngineFileInput"
      type="file"
      accept="application/json"
      style="display: none"
      @change="handleCustomSearchEngineFileChange"
    />
  </div>
</template>
