<script setup lang="ts">
import { browser } from 'wxt/browser'
import { FormatQuoteRound } from '@vicons/material'

import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/shared/settings'

const lang = browser.i18n.getUILanguage()
const isNotChinese = !lang.startsWith('zh')

const settingsStore = useSettingsStore()
</script>

<template>
  <div class="settings__title">
    <el-icon><format-quote-round /></el-icon>
    <span>{{ i18n.t('newtab.settings.yiyan.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.yiyan.enabled') }}</div>
      <el-switch v-model="settingsStore.yiyan.enabled" />
    </div>
    <p v-if="isNotChinese" class="settings__item--note">
      {{ i18n.t('newtab.settings.yiyan.description') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.yiyan.alwaysShow') }}</div>
      <el-switch v-model="settingsStore.yiyan.alwaysShow" />
    </div>
    <p class="settings__item--note">
      {{ i18n.t('newtab.settings.yiyan.normalyShowTip') }}
    </p>
  </div>
</template>
