<script setup lang="ts">
import { ClockCircleOutlined } from '@vicons/antd'
import { browser } from 'wxt/browser'

import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/newtab/scripts/store/settingsStore'

const settingsStore = useSettingsStore()
const isChinese = browser.i18n.getUILanguage().startsWith('zh')
</script>

<template>
  <div class="settings__title">
    <el-icon><clock-circle-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.clock.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.clock.use12HourClock') }}</div>
      <el-switch v-model="settingsStore.time.isMeridiem" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.clock.showAMPM') }}</div>
      <el-switch v-model="settingsStore.time.showMeridiem" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.clock.showDate') }}</div>
      <el-switch v-model="settingsStore.time.showDate" />
    </div>
    <div
      v-if="settingsStore.time.showDate && isChinese"
      class="settings__item settings__item--horizontal"
    >
      <div class="settings__label">{{ i18n.t('newtab.settings.clock.showLunar') }}</div>
      <el-switch v-model="settingsStore.time.showLunar" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.clock.enableShadow') }}</div>
      <el-switch v-model="settingsStore.time.enableShadow" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.clock.invertColorLight') }}</div>
      <el-switch v-model="settingsStore.time.invertColor.light" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.clock.invertColorDark') }}</div>
      <el-switch v-model="settingsStore.time.invertColor.night" />
    </div>
  </div>
</template>
