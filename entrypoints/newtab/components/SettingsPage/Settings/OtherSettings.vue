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

import { downloadJSON } from '@/shared/json'
import {
  type CURRENT_CONFIG_INTERFACE,
  defaultSettings,
  useBingWallpaperStore,
  useDarkWallpaperStore,
  useSettingsStore,
  useWallpaperStore
} from '@/shared/settings'
import { deinitSyncSettings, initSyncSettings } from '@/shared/sync'

const { t } = useTranslation()

const isGoogleChrome = import.meta.env.CHROME && !import.meta.env.EDGE
const settings = useSettingsStore()

async function confirmClearExtensionData() {
  try {
    await ElMessageBox.confirm(
      t('newtab:settings.other.confirmPurgeData.message'),
      t('newtab:settings.other.confirmPurgeData.title'),
      {
        confirmButtonText: t('newtab:settings.other.confirmPurgeData.confirm'),
        cancelButtonText: t('newtab:settings.other.confirmPurgeData.cancel'),
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
      t('newtab:settings.other.confirmPurgeWallpaper.message'),
      t('newtab:settings.other.confirmPurgeWallpaper.title'),
      {
        confirmButtonText: t('newtab:settings.other.confirmPurgeData.confirm'),
        cancelButtonText: t('newtab:settings.other.confirmPurgeData.cancel'),
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
    text: t('newtab:settings.other.confirmPurgeWallpaper.purging'),
    body: true,
    background: 'var(--el-overlay-color-light)'
  })

  Promise.all([
    resetSettings(),
    useWallpaperStore.clear(),
    useDarkWallpaperStore.clear(),
    useBingWallpaperStore.clear()
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
    text: t('newtab:settings.other.confirmPurgeData.purging'),
    body: true,
    background: 'var(--el-overlay-color-light)'
  })

  Promise.all([
    localStorage.clear(),
    sessionStorage.clear(),
    useWallpaperStore.clear(),
    useDarkWallpaperStore.clear(),
    useBingWallpaperStore.clear(),
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

const fileInput = ref<HTMLInputElement | null>(null)

async function openFilePicker() {
  try {
    await ElMessageBox.confirm(
      t('newtab:settings.other.importExport.warningDialog.title'),
      t('newtab:settings.other.importExport.warningDialog.content'),
      {
        confirmButtonText: t('newtab:settings.other.importExport.warningDialog.yes'),
        cancelButtonText: t('newtab:settings.other.importExport.warningDialog.no'),
        type: 'warning'
      }
    )
    fileInput.value?.click()
  } catch {}
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input?.files?.[0]
  const reader = new FileReader()
  let fileContent: CURRENT_CONFIG_INTERFACE | null = null

  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result as string) as CURRENT_CONFIG_INTERFACE
      fileContent = json
    } catch (error) {
      console.error('Invalid JSON file:', error)
    }
  }

  if (file) {
    reader.readAsText(file)
    return new Promise<void>((resolve) => {
      reader.onloadend = () => {
        if (fileContent) {
          const originalSyncState = settings.sync.enabled
          settings.$patch(fileContent)
          if (originalSyncState !== settings.sync.enabled) {
            // 如果同步状态有变化，重新初始化或取消同步
            if (settings.sync.enabled) {
              initSyncSettings(settings)
            } else {
              deinitSyncSettings()
            }
          }
          ElMessage.success('导入成功')
        } else {
          ElMessage.error('导入失败')
        }
        // 重置 file input 以允许导入同一个文件
        if (fileInput.value) fileInput.value.value = ''
        resolve()
      }
    })
  } else {
    console.error('No file selected')
  }
}
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.other.sync') }}</div>
      <el-switch v-model="settings.sync.enabled" @change="sendSyncMessage" />
    </div>
    <p class="settings__item--note">
      {{ t('newtab:settings.other.syncWarning') }}
      <cloud-off-round />
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:changelog.hideMajorChangelog') }}</div>
      <el-switch v-model="settings.hideMajorChangelog" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.other.importExport.title') }}</div>
      <span>
        <el-button
          type="primary"
          :icon="DownloadRound"
          @click="
            downloadJSON<CURRENT_CONFIG_INTERFACE>(settings.$state, 'lemon-tab-page-settings.json')
          "
        >
          {{ t('newtab:settings.other.importExport.export') }}
        </el-button>
        <el-button :icon="FileUploadRound" @click="openFilePicker">
          {{ t('newtab:settings.other.importExport.import') }}
        </el-button>
      </span>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.other.purgeWallpaperData') }}</div>
      <el-button type="danger" :icon="DeleteForeverOutlined" @click="confirmClearWallpaperData">
        {{ t('newtab:settings.other.purge') }}
      </el-button>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.other.purgeData') }}</div>
      <el-button type="danger" :icon="DeleteForeverOutlined" @click="confirmClearExtensionData">
        {{ t('newtab:settings.other.purge') }}
      </el-button>
    </div>
    <div v-if="isGoogleChrome" class="settings__item">
      <div class="settings__label" style="min-height: 32px">
        {{ t('newtab:settings.other.want_to_customize_chrome') }}
      </div>
      <p class="settings__item--note">
        {{ t('newtab:settings.other.customize_chrome_tips') }}
      </p>
    </div>
    <!-- hidden file input used by 导入按钮 -->
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>
