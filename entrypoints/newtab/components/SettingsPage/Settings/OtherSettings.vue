<script setup lang="ts">
import { ref } from 'vue'

import { ControlOutlined } from '@vicons/antd'
import {
  CloudOffRound,
  DeleteForeverOutlined,
  DownloadRound,
  FileUploadRound
} from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { storage } from '#imports'

import { downloadJSON } from '@/shared/json'
import {
  type CURRENT_CONFIG_INTERFACE,
  useBingWallpaperStore,
  useDarkWallpaperStore,
  useSettingsStore,
  useWallpaperStore
} from '@/shared/settings'
import { deinitSyncSettings, initSyncSettings } from '@/shared/sync'

const { t } = useTranslation()

const isGoogleChrome = import.meta.env.CHROME && !import.meta.env.EDGE
const settingsStore = useSettingsStore()

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

  await clearExtensionData()
}

async function clearExtensionData() {
  console.warn(t('newtab:settings.other.confirmPurgeData.purging'))
  // Clear browser storage
  await Promise.all([localStorage.clear(), sessionStorage.clear()]).catch(console.error)

  // Clear all extension storage in parallel
  await Promise.all([
    useWallpaperStore.clear(),
    useDarkWallpaperStore.clear(),
    useBingWallpaperStore.clear(),
    storage.clear('local'),
    storage.clear('session'),
    storage.clear('sync')
  ]).catch(console.error)

  location.reload()
}

function sendSyncMessage() {
  if (settingsStore.sync.enabled) {
    initSyncSettings(settingsStore)
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
          const originalSyncState = settingsStore.sync.enabled
          settingsStore.$patch(fileContent)
          if (originalSyncState !== settingsStore.sync.enabled) {
            // 如果同步状态有变化，重新初始化或取消同步
            if (settingsStore.sync.enabled) {
              initSyncSettings(settingsStore)
            } else {
              deinitSyncSettings()
            }
          }
          ElMessage.success('导入成功')
        } else {
          ElMessage.error('导入失败')
        }
        // reset input so selecting the same file again will trigger change
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
  <div class="settings__title">
    <el-icon><control-outlined /></el-icon>
    <span>{{ t('newtab:settings.other.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.other.sync') }}</div>
      <el-switch v-model="settingsStore.sync.enabled" @change="sendSyncMessage" />
    </div>
    <p class="settings__item--note">
      {{ t('newtab:settings.other.syncWarning') }}
      <cloud-off-round />
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:settings.other.importExport.title') }}</div>
      <span>
        <el-button
          type="primary"
          :icon="DownloadRound"
          @click="
            downloadJSON<CURRENT_CONFIG_INTERFACE>(
              settingsStore.$state,
              'lemon-tab-page-settings.json'
            )
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
      <div class="settings__label">{{ t('newtab:settings.other.purgeData') }}</div>
      <el-button type="danger" :icon="DeleteForeverOutlined" @click="confirmClearExtensionData">{{
        t('newtab:settings.other.purge')
      }}</el-button>
    </div>
    <div v-if="isGoogleChrome" class="settings__item">
      <div class="settings__label" style="min-height: 32px">
        {{ t('newtab:settings.other.want_to_customize_chrome') }}
      </div>
      <p class="settings__item--note">
        {{ t('newtab:settings.other.customize_chrome_tips') }}
      </p>
    </div>
  </div>
  <!-- hidden file input used by 导入按钮 -->
  <input
    ref="fileInput"
    type="file"
    accept="application/json"
    style="display: none"
    @change="handleFileChange"
  />
</template>
