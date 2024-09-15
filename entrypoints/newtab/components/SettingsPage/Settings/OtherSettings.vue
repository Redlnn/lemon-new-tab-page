<script setup lang="ts">
import 'element-plus/theme-chalk/el-message-box.css'
import { ControlOutlined } from '@vicons/antd'
import { DeleteForeverOutlined } from '@vicons/material'
import { ElMessageBox } from 'element-plus'

import { blockedTopStitesStorage } from '@/entrypoints/newtab/js/store/topSitesStore'
import { i18n } from '@/.wxt/i18n'
import { searchHistoriesStorage } from '@/entrypoints/newtab/js/store/searchStore'
import { useWallpaperStore } from '@/entrypoints/newtab/js/store'
import { defaultBookmark, saveBookmark } from '@/entrypoints/newtab/js/store/bookmarkStore'
import {
  defaultSettings,
  saveSettings,
  useSettingsStore
} from '@/entrypoints/newtab/js/store/settingsStore'

const isGoogleChrome = import.meta.env.CHROME
const settingsStore = useSettingsStore()

async function confirmClearExtensionData() {
  try {
    await ElMessageBox.confirm(
      i18n.t('newtab.settings.other.confirm_purge_data.messgae'),
      i18n.t('newtab.settings.other.confirm_purge_data.title'),
      {
        confirmButtonText: i18n.t('newtab.settings.other.confirm_purge_data.confirm'),
        cancelButtonText: i18n.t('newtab.settings.other.confirm_purge_data.cancel'),
        type: 'warning'
      }
    )
  } catch {
    return
  }

  await clearExtensionData()
}

async function clearExtensionData() {
  console.warn(i18n.t('newtab.settings.other.confirm_purge_data.purging'))
  localStorage.clear()
  sessionStorage.clear()
  await blockedTopStitesStorage.setValue([])
  await saveBookmark(defaultBookmark)
  await searchHistoriesStorage.setValue([])
  await useWallpaperStore.clear()
  await saveSettings(defaultSettings)
  location.reload()
}
</script>

<template>
  <div class="settings-title">
    <el-icon><control-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.other.title') }}</span>
  </div>
  <div class="setting-items-container">
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.other.yiyan') }}</div>
      <el-switch v-model="settingsStore.search.enableYiyan" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.other.purge_data') }}</div>
      <el-button
        type="danger"
        :icon="DeleteForeverOutlined"
        circle
        @click="confirmClearExtensionData"
      />
    </div>
    <div class="settings-item" v-if="isGoogleChrome">
      <div class="settings-label">
        {{ i18n.t('newtab.settings.other.want_to_customize_chrome') }}
      </div>
      <p style="color: var(--el-text-color-regular); line-height: 1.5em; font-size: 12px">
        {{ i18n.t('newtab.settings.other.customize_chrome_tips') }}
      </p>
    </div>
  </div>
</template>
