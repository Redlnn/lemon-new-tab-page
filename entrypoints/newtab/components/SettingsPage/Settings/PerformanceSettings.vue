<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

const { t } = useTranslation('settings')

const settings = useSettingsStore()

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

const dialogTransparent = useNegate(settings.perf, 'disableDialogTransparent')
const dialogBlur = useNegate(settings.perf, 'disableDialogBlur')
const dialogAnimation = useNegate(settings.perf, 'disableDialogAnimation')
const focusScale = useNegate(settings.perf, 'disableFocusScale')
const focusBlur = useNegate(settings.perf, 'disableFocusBlur')
const shortcutTransparent = useNegate(settings.perf, 'disableShortcutTransparent')
const shortcutBlur = useNegate(settings.perf, 'disableShortcutBlur')
const searchBarTransparent = useNegate(settings.perf, 'disableSearchBarTransparent')
const searchBarBlur = useNegate(settings.perf, 'disableSearchBarBlur')
const yiyanTransparent = useNegate(settings.perf, 'disableYiyanTransparent')
const yiyanBlur = useNegate(settings.perf, 'disableYiyanBlur')
const settingsBtnBlur = useNegate(settings.perf, 'disableSettingsBtnBlur')
const settingsBtnTransparent = useNegate(settings.perf, 'disableSettingsBtnTransparent')

function disableTransparentSettings() {
  settings.perf.disableDialogTransparent = true
  settings.perf.disableSearchBarTransparent = true
  settings.perf.disableSettingsBtnTransparent = true
  settings.perf.disableShortcutTransparent = true
  settings.perf.disableYiyanTransparent = true
}

function disableBlurSettings() {
  settings.perf.disableDialogBlur = true
  settings.perf.disableSearchBarBlur = true
  settings.perf.disableSettingsBtnBlur = true
  settings.perf.disableShortcutBlur = true
  settings.perf.disableYiyanBlur = true
}
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.blinkingColon') }}</div>
      <el-switch v-model="settings.time.blinkingColon" />
    </div>
    <p class="settings__item--note">
      {{ t('clock.blinkingTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.disableAll.title') }}</div>
      <span>
        <el-button @click="disableTransparentSettings">
          {{ t('perf.disableAll.transparent') }}
        </el-button>
        <el-button @click="disableBlurSettings">
          {{ t('perf.disableAll.blur') }}
        </el-button>
      </span>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.dialogTransparent') }}</div>
      <el-switch v-model="dialogTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.dialogBlur') }}</div>
      <el-switch :disabled="settings.perf.disableDialogTransparent" v-model="dialogBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.dialogAnimation') }}</div>
      <el-switch v-model="dialogAnimation" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.focusScale') }}</div>
      <el-switch v-model="focusScale" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.focusBlur') }}</div>
      <el-switch v-model="focusBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.searchBarTransparent') }}</div>
      <el-switch v-model="searchBarTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.searchBarBlur') }}</div>
      <el-switch :disabled="settings.perf.disableSearchBarTransparent" v-model="searchBarBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.shortcutTransparent') }}</div>
      <el-switch v-model="shortcutTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.shortcutBlur') }}</div>
      <el-switch :disabled="settings.perf.disableShortcutTransparent" v-model="shortcutBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.yiyanTransparent') }}</div>
      <el-switch v-model="yiyanTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.yiyanBlur') }}</div>
      <el-switch :disabled="settings.perf.disableYiyanTransparent" v-model="yiyanBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.settingsBtnTransparent') }}</div>
      <el-switch v-model="settingsBtnTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.settingsBtnBlur') }}</div>
      <el-switch
        :disabled="settings.perf.disableSettingsBtnTransparent"
        v-model="settingsBtnBlur"
      />
    </div>
  </div>
</template>
