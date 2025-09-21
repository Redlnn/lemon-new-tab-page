<script setup lang="ts">
import { ApiRound } from '@vicons/material'

import { t } from '@/shared/i18n'
import { useSettingsStore } from '@/shared/settings'

const settingsStore = useSettingsStore()
</script>

<template>
  <div class="settings__title">
    <el-icon><api-round /></el-icon>
    <span>{{ t('newtab.settings.perf.title') }}</span>
  </div>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.clock.blinkingColon') }}</div>
      <el-switch v-model="settingsStore.time.blinkingColon" />
    </div>
    <p class="settings__item--note">
      {{ t('newtab.settings.clock.blinkingTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.disableDialogTransparent') }}</div>
      <el-switch v-model="settingsStore.perf.disableDialogTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.disableDialogBlur') }}</div>
      <el-switch
        :disabled="settingsStore.perf.disableDialogTransparent"
        v-model="settingsStore.perf.disableDialogBlur"
      />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.disableDialogAnimation') }}</div>
      <el-switch v-model="settingsStore.perf.disableDialogAnimation" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.disableFocusScale') }}</div>
      <el-switch v-model="settingsStore.perf.disableFocusScale" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.disableFocusBlur') }}</div>
      <el-switch v-model="settingsStore.perf.disableFocusBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.disableSearchBarTransparent') }}</div>
      <el-switch v-model="settingsStore.perf.disableSearchBarTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.disableSearchBarBlur') }}</div>
      <el-switch
        :disabled="settingsStore.perf.disableSearchBarTransparent"
        v-model="settingsStore.perf.disableSearchBarBlur"
      />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.disableShortcutTransparent') }}</div>
      <el-switch v-model="settingsStore.perf.disableShortcutTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.disableShortcutBlur') }}</div>
      <el-switch
        :disabled="settingsStore.perf.disableShortcutTransparent"
        v-model="settingsStore.perf.disableShortcutBlur"
      />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.disableYiyanBlur') }}</div>
      <el-switch v-model="settingsStore.perf.disableYiyanBlur" />
    </div>
  </div>
</template>
