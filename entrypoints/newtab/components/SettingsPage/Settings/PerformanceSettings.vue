<script setup lang="ts">
import type { ComputedRef, Ref } from 'vue'
import { computed, toRef } from 'vue'

import { ApiRound } from '@vicons/material'

import { t } from '@/shared/i18n'
import { useSettingsStore } from '@/shared/settings'

const settingsStore = useSettingsStore()

function useNegate(source: Ref<boolean>): ComputedRef<boolean>
function useNegate<T extends object, K extends keyof T>(obj: T, key: K): ComputedRef<boolean>
function useNegate(arg1: Ref<boolean> | object, arg2?: string) {
  const src: Ref<boolean> =
    arg2 !== undefined ? toRef(arg1 as Record<string, boolean>, arg2) : (arg1 as Ref<boolean>)
  return computed<boolean>({
    get: () => !src.value,
    set: (val: boolean) => {
      src.value = !val
    }
  })
}

const dialogTransparent = useNegate(settingsStore.perf, 'disableDialogTransparent')
const dialogBlur = useNegate(settingsStore.perf, 'disableDialogBlur')
const dialogAnimation = useNegate(settingsStore.perf, 'disableDialogAnimation')
const focusScale = useNegate(settingsStore.perf, 'disableFocusScale')
const focusBlur = useNegate(settingsStore.perf, 'disableFocusBlur')
const shortcutTransparent = useNegate(settingsStore.perf, 'disableShortcutTransparent')
const shortcutBlur = useNegate(settingsStore.perf, 'disableShortcutBlur')
const searchBarTransparent = useNegate(settingsStore.perf, 'disableSearchBarTransparent')
const searchBarBlur = useNegate(settingsStore.perf, 'disableSearchBarBlur')
const yiyanBlur = useNegate(settingsStore.perf, 'disableYiyanBlur')
const settingsBtnBlur = useNegate(settingsStore.perf, 'disableSettingsBtnBlur')
const settingsBtnTransparent = useNegate(settingsStore.perf, 'disableSettingsBtnTransparent')
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
      <div class="settings__label">{{ t('newtab.settings.perf.dialogTransparent') }}</div>
      <el-switch v-model="dialogTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.dialogBlur') }}</div>
      <el-switch :disabled="settingsStore.perf.disableDialogTransparent" v-model="dialogBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.dialogAnimation') }}</div>
      <el-switch v-model="dialogAnimation" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.focusScale') }}</div>
      <el-switch v-model="focusScale" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.focusBlur') }}</div>
      <el-switch v-model="focusBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.searchBarTransparent') }}</div>
      <el-switch v-model="searchBarTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.searchBarBlur') }}</div>
      <el-switch
        :disabled="settingsStore.perf.disableSearchBarTransparent"
        v-model="searchBarBlur"
      />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.shortcutTransparent') }}</div>
      <el-switch v-model="shortcutTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.shortcutBlur') }}</div>
      <el-switch :disabled="settingsStore.perf.disableShortcutTransparent" v-model="shortcutBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.yiyanBlur') }}</div>
      <el-switch v-model="yiyanBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.settingsBtnTransparent') }}</div>
      <el-switch v-model="settingsBtnTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab.settings.perf.settingsBtnBlur') }}</div>
      <el-switch
        :disabled="settingsStore.perf.disableSettingsBtnTransparent"
        v-model="settingsBtnBlur"
      />
    </div>
  </div>
</template>
