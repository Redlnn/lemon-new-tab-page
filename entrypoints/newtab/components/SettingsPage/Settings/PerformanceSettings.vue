<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

const { t } = useTranslation('settings')

const settings = useSettingsStore()

function toggleTransparentSettings(enable: boolean) {
  settings.perf.enableBookmarkTransparent = enable
  settings.perf.enableDialogTransparent = enable
  settings.perf.enableSearchBarTransparent = enable
  settings.perf.enableSettingsBtnTransparent = enable
  settings.perf.enableShortcutTransparent = enable
  settings.perf.enableYiyanTransparent = enable
}

function toggleBlurSettings(enable: boolean) {
  settings.perf.enableBookmarkBlur = enable
  settings.perf.enableDialogBlur = enable
  settings.perf.enableSearchBarBlur = enable
  settings.perf.enableSettingsBtnBlur = enable
  settings.perf.enableShortcutBlur = enable
  settings.perf.enableYiyanBlur = enable
  settings.perf.enableFocusBlur = enable
}

function toggleAnimationSettings(enable: boolean) {
  settings.clock.blink = enable
  settings.perf.enableDialogAnimation = enable
  settings.perf.enableFocusScale = enable
  settings.perf.enableFocusBlur = enable
  settings.search.launchAnimation = enable
  settings.perf.enableBgSwitchAnim = enable
  settings.perf.enableDockScale = enable
  settings.perf.enableYiyanRipple = enable
}
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label" style="color: var(--el-color-danger-dark-2)">
        {{ t('perf.toggleAll.disable') }}
      </div>
      <span class="button-group">
        <el-button @click="toggleAnimationSettings(false)">
          {{ t('perf.toggleAll.animation') }}
        </el-button>
        <el-button @click="toggleTransparentSettings(false)">
          {{ t('perf.toggleAll.transparent') }}
        </el-button>
        <el-button @click="toggleBlurSettings(false)">
          {{ t('perf.toggleAll.blur') }}
        </el-button>
      </span>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label" style="color: var(--el-color-success-dark-2)">
        {{ t('perf.toggleAll.enable') }}
      </div>
      <span class="button-group">
        <el-button @click="toggleAnimationSettings(true)">
          {{ t('perf.toggleAll.animation') }}
        </el-button>
        <el-button @click="toggleTransparentSettings(true)">
          {{ t('perf.toggleAll.transparent') }}
        </el-button>
        <el-button @click="toggleBlurSettings(true)">
          {{ t('perf.toggleAll.blur') }}
        </el-button>
      </span>
    </div>
    <el-divider></el-divider>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.pauseWhenBlur') }}</div>
      <el-switch v-model="settings.background.pauseOnBlur" />
    </div>
    <p class="settings__item--note">
      {{ t('background.videoBlurTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('clock.blinkingColon') }}</div>
      <el-switch v-model="settings.clock.blink" />
    </div>
    <p class="settings__item--note">
      {{ t('clock.blinkingTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.bgSwitchAnim') }}</div>
      <el-switch v-model="settings.perf.enableBgSwitchAnim" />
    </div>
    <p class="settings__item--note">
      {{ t('perf.bgSwitchAnimTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.bookmarkTransparent') }}</div>
      <el-switch v-model="settings.perf.enableBookmarkTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.bookmarkBlur') }}</div>
      <el-switch :disabled="!settings.perf.enableBookmarkTransparent" v-model="settings.perf.enableBookmarkBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.dialogTransparent') }}</div>
      <el-switch v-model="settings.perf.enableDialogTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.dialogBlur') }}</div>
      <el-switch :disabled="!settings.perf.enableDialogTransparent" v-model="settings.perf.enableDialogBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.dialogAnimation') }}</div>
      <el-switch v-model="settings.perf.enableDialogAnimation" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('search.launchAnim') }}</div>
      <el-switch v-model="settings.search.launchAnimation" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.focusScale') }}</div>
      <el-switch v-model="settings.perf.enableFocusScale" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.focusBlur') }}</div>
      <el-switch v-model="settings.perf.enableFocusBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.searchBarTransparent') }}</div>
      <el-switch v-model="settings.perf.enableSearchBarTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.searchBarBlur') }}</div>
      <el-switch :disabled="!settings.perf.enableSearchBarTransparent" v-model="settings.perf.enableSearchBarBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.shortcutTransparent') }}</div>
      <el-switch v-model="settings.perf.enableShortcutTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.shortcutBlur') }}</div>
      <el-switch :disabled="!settings.perf.enableShortcutTransparent" v-model="settings.perf.enableShortcutBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.yiyanTransparent') }}</div>
      <el-switch v-model="settings.perf.enableYiyanTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.yiyanBlur') }}</div>
      <el-switch :disabled="!settings.perf.enableYiyanTransparent" v-model="settings.perf.enableYiyanBlur" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.yiyanRipple') }}</div>
      <el-switch v-model="settings.perf.enableYiyanRipple" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.actionBtnTransparent') }}</div>
      <el-switch v-model="settings.perf.enableSettingsBtnTransparent" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.actionBtnBlur') }}</div>
      <el-switch
        :disabled="!settings.perf.enableSettingsBtnTransparent"
        v-model="settings.perf.enableSettingsBtnBlur"
      />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('perf.dockScale') }}</div>
      <el-switch v-model="settings.perf.enableDockScale" />
    </div>
  </div>
</template>
