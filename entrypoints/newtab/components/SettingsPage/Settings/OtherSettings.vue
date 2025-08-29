<script setup lang="ts">
import { ControlOutlined } from '@vicons/antd'
import {
  DeleteForeverOutlined,
  CloudOffRound,
  DownloadRound,
  FileUploadRound
} from '@vicons/material'
import { ref } from 'vue'

import { storage } from '#imports'
import { i18n } from '@/.wxt/i18n'
import {
  useSettingsStore,
  useWallpaperStore,
  type CURRENT_CONFIG_INTERFACE
} from '@/shared/settings'
import { deinitSyncSettings, initSyncSettings } from '@/shared/sync'
import { downloadJSON } from '@/shared/json'

const isGoogleChrome = import.meta.env.CHROME && !import.meta.env.EDGE
const settingsStore = useSettingsStore()

async function confirmClearExtensionData() {
  try {
    await ElMessageBox.confirm(
      i18n.t('newtab.settings.other.confirmPurgeData.message'),
      i18n.t('newtab.settings.other.confirmPurgeData.title'),
      {
        confirmButtonText: i18n.t('newtab.settings.other.confirmPurgeData.confirm'),
        cancelButtonText: i18n.t('newtab.settings.other.confirmPurgeData.cancel'),
        type: 'warning'
      }
    )
  } catch {
    return
  }

  await clearExtensionData()
}

async function clearExtensionData() {
  console.warn(i18n.t('newtab.settings.other.confirmPurgeData.purging'))
  localStorage.clear()
  sessionStorage.clear()
  await useWallpaperStore.clear()
  await storage.clear('local')
  await storage.clear('session')
  await storage.clear('sync')
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
    await ElMessageBox.confirm('导入配置文件将覆盖当前设置，是否继续？', '原有配置将被覆盖', {
      confirmButtonText: '继续！',
      cancelButtonText: '不要啊',
      type: 'warning'
    })
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
      console.log('Parsed JSON:', json)
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
          ElMessage({
            message: '导入成功',
            type: 'success'
          })
        } else {
          ElMessage({
            message: '导入失败',
            type: 'error'
          })
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
    <span>{{ i18n.t('newtab.settings.other.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.other.sync') }}</div>
      <el-switch v-model="settingsStore.sync.enabled" @change="sendSyncMessage" />
    </div>
    <div class="settings__item">
      <p class="settings__item--note">
        {{ i18n.t('newtab.settings.other.syncWarning') }}
        <cloud-off-round />
      </p>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.other.importExport.title') }}</div>
      <span>
        <el-button
          type="primary"
          :icon="DownloadRound"
          round
          size="small"
          @click="
            downloadJSON<CURRENT_CONFIG_INTERFACE>(
              settingsStore.$state,
              'lemon-tab-page-settings.json'
            )
          "
        >
          {{ i18n.t('newtab.settings.other.importExport.export') }}
        </el-button>
        <el-button :icon="FileUploadRound" round size="small" @click="openFilePicker">
          {{ i18n.t('newtab.settings.other.importExport.import') }}
        </el-button>
      </span>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.other.purgeData') }}</div>
      <el-button
        type="danger"
        :icon="DeleteForeverOutlined"
        circle
        @click="confirmClearExtensionData"
      />
    </div>
    <div v-if="isGoogleChrome" class="settings__item">
      <div class="settings__label">
        {{ i18n.t('newtab.settings.other.want_to_customize_chrome') }}
      </div>
      <p class="settings__item--note">
        {{ i18n.t('newtab.settings.other.customize_chrome_tips') }}
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
