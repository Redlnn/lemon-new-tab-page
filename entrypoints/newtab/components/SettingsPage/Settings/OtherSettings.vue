<script setup lang="ts">
import { ControlOutlined } from '@vicons/antd'
import { DeleteForeverOutlined, CloudOffRound } from '@vicons/material'

import { storage } from '#imports'
import { i18n } from '@/.wxt/i18n'
import { useSettingsStore, useWallpaperStore } from '@/shared/settings'
import { deinitSyncSettings, initSyncSettings } from '@/shared/sync'

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
</template>
