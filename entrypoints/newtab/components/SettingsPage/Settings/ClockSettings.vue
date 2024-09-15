<script setup lang="ts">
import { ClockCircleOutlined } from '@vicons/antd'
import { browser } from 'wxt/browser'

import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/entrypoints/newtab/js/store/settingsStore'

const settingsStore = useSettingsStore()
const isChinese = browser.i18n.getUILanguage().startsWith('zh')
</script>

<template>
  <div class="settings-title">
    <el-icon><clock-circle-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.clock.title') }}</span>
  </div>
  <div class="setting-items-container">
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.clock.use12HourClock') }}</div>
      <el-switch v-model="settingsStore.time.isMeridiem" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.clock.showAMPM') }}</div>
      <el-switch v-model="settingsStore.time.showMeridiem" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.clock.showDate') }}</div>
      <el-switch v-model="settingsStore.time.showDate" />
    </div>
    <div class="settings-item horizontal" v-if="settingsStore.time.showDate && isChinese">
      <div class="settings-label">{{ i18n.t('newtab.settings.clock.showLunar') }}</div>
      <el-switch v-model="settingsStore.time.showLunar" />
    </div>
  </div>
</template>
