<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { isChinese } from '@/shared/i18n'
import { useSettingsStore } from '@/shared/settings'

const { t } = useTranslation('settings')

const settings = useSettingsStore()
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:common.enable') }}</div>
      <el-switch v-model="settings.clock.enabled" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.use12HourClock') }}</div>
      <el-switch v-model="settings.clock.isMeridiem" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.showAMPM') }}</div>
      <el-switch v-model="settings.clock.showMeridiem" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.showDate') }}</div>
      <el-switch v-model="settings.clock.showDate" />
    </div>
    <div
      v-if="settings.clock.showDate && isChinese"
      class="settings__item settings__item--horizontal"
    >
      <div class="settings__label">{{ t('clock.showLunar') }}</div>
      <el-switch v-model="settings.clock.showLunar" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.showSeconds') }}</div>
      <el-switch v-model="settings.clock.showSeconds" />
    </div>
    <p class="settings__item--note">
      {{ t('clock.secondsTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.smallFont') }}</div>
      <el-switch v-model="settings.clock.small" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.enableShadow') }}</div>
      <el-switch v-model="settings.clock.shadow" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.blinkingColon') }}</div>
      <el-switch v-model="settings.clock.blink" />
    </div>
    <p class="settings__item--note">
      {{ t('clock.blinkingTip') }}
    </p>
  </div>
</template>
