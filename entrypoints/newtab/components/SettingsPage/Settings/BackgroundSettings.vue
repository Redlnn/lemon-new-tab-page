<script setup lang="ts">
import { BubbleChartRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { BgType, useSettingsStore } from '@/shared/settings'

import { OPEN_BACKGROUND_PREFERENCE } from '@newtab/shared/keys'

const { t } = useTranslation('settings')

const settings = useSettingsStore()

const predefineMaskColor = ['#f2f3f5', '#000']

const openBackgroundPreference = inject(OPEN_BACKGROUND_PREFERENCE)
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.change') }}</div>
      <el-button
        :icon="BubbleChartRound"
        @click="openBackgroundPreference && openBackgroundPreference()"
      >
        {{ t('search.clickToChange') }}
      </el-button>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.pauseWhenBlur') }}</div>
      <el-switch v-model="settings.background.pauseWhenBlur" />
    </div>
    <p class="settings__item--note">
      {{ t('background.videoBlurTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.enableVignetting') }}</div>
      <el-switch v-model="settings.background.enableVignetting" />
    </div>
    <div
      v-if="settings.background.bgType !== BgType.None"
      class="settings__item settings__item--vertical"
    >
      <div class="settings__label">{{ t('background.blur') }}</div>
      <el-slider v-model="settings.background.blurIntensity" :show-tooltip="false" />
    </div>
    <div class="settings__item">
      <div class="settings__label settings__item--vertical">
        {{ t('background.maskOpacity') }}
      </div>
      <el-slider v-model="settings.background.bgMaskOpacity" :show-tooltip="false" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.maskColor') }}</div>
      <span>
        <span>{{ t('theme.lightMode') }}:&ensp;</span>
        <el-color-picker
          v-model="settings.background.lightMaskColor"
          :predefine="predefineMaskColor"
          @change="
            () => {
              if (settings.background.lightMaskColor === null) {
                settings.background.lightMaskColor = '#f2f3f5'
              }
            }
          "
        />
        <span style="margin-left: 1em">{{ t('theme.darkMode') }}:&ensp;</span>
        <el-color-picker
          v-model="settings.background.nightMaskColor"
          :predefine="predefineMaskColor"
          @change="
            () => {
              if (settings.background.nightMaskColor === null) {
                settings.background.nightMaskColor = '#000'
              }
            }
          "
        />
      </span>
    </div>
  </div>
</template>
