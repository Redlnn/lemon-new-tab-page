<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { isChinese } from '@/shared/lang'
import { useSettingsStore } from '@/shared/settings'

const { t } = useTranslation('settings')

const settings = useSettingsStore()
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:common.enable') }}</div>
      <el-switch v-model="settings.time.enabled" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.use12HourClock') }}</div>
      <el-switch v-model="settings.time.isMeridiem" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.showAMPM') }}</div>
      <el-switch v-model="settings.time.showMeridiem" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.showDate') }}</div>
      <el-switch v-model="settings.time.showDate" />
    </div>
    <div
      v-if="settings.time.showDate && isChinese"
      class="settings__item settings__item--horizontal"
    >
      <div class="settings__label">{{ t('clock.showLunar') }}</div>
      <el-switch v-model="settings.time.showLunar" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.smallFont') }}</div>
      <el-switch v-model="settings.time.small" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.enableShadow') }}</div>
      <el-switch v-model="settings.time.enableShadow" />
    </div>
  </div>
</template>
