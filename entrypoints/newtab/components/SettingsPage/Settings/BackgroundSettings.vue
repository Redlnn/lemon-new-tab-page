<script setup lang="ts">
import { BubbleChartRound, CloudOffRound } from '@vicons/material'
import i18next from 'i18next'
import { useTranslation } from 'i18next-vue'

import { BgType } from '@/shared/enums'
import { useSettingsStore } from '@/shared/settings'

import { PermissionResult, usePermission } from '@newtab/composables/usePermission'
import { OPEN_BACKGROUND_PREFERENCE } from '@newtab/shared/keys'

const { t } = useTranslation('settings')

const settings = useSettingsStore()

const predefineMaskColor = ['#f2f3f5', '#000']

const openBackgroundPreference = inject(OPEN_BACKGROUND_PREFERENCE)

const { checkAndRequestPermission } = usePermission()

const beforeCacheChange = async () => {
  // 已经开了就是想要关，所以允许关
  if (settings.background.online.cacheEnable) return true
  // 不是在线壁纸不允许开
  if (settings.background.bgType !== BgType.Online) return false
  // 没有在线壁纸url不给开
  if (!settings.background.online.url) return false

  const { hostname } = new URL(settings.background.online.url)
  const result = await checkAndRequestPermission(hostname, true)
  const res = result === PermissionResult.GrantedAll
  if (res) ElMessage.success(i18next.t('settings:background.cache.nextStartup'))
  else ElMessage.warning(i18next.t('settings:background.warning.cacheDisabled'))
  return res
}
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('background.change') }}
        <cloud-off-round />
      </div>
      <el-button
        :icon="BubbleChartRound"
        @click="openBackgroundPreference && openBackgroundPreference()"
      >
        {{ t('search.clickToChange') }}
      </el-button>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.pauseWhenBlur') }}</div>
      <el-switch v-model="settings.background.pauseOnBlur" />
    </div>
    <p class="settings__item--note">
      {{ t('background.videoBlurTip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.fasterBgAnim') }}</div>
      <el-switch v-model="settings.background.fastAnimation" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.enableVignetting') }}</div>
      <el-switch v-model="settings.background.vignette" />
    </div>
    <div
      v-if="settings.background.bgType !== BgType.None"
      class="settings__item settings__item--vertical"
    >
      <div class="settings__label">{{ t('background.blur') }}</div>
      <el-slider v-model="settings.background.blur" :show-tooltip="false" />
    </div>
    <div class="settings__item">
      <div class="settings__label settings__item--vertical">
        {{ t('background.maskOpacity') }}
      </div>
      <el-slider v-model="settings.background.mask.opacity" :show-tooltip="false" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.maskColor') }}</div>
      <span>
        <span>{{ t('theme.lightMode') }}:&ensp;</span>
        <el-color-picker
          v-model="settings.background.mask.light"
          :predefine="predefineMaskColor"
          @change="
            () => {
              if (settings.background.mask.light === null) {
                settings.background.mask.light = '#f2f3f5'
              }
            }
          "
        />
        <span style="margin-left: 1em">{{ t('theme.darkMode') }}:&ensp;</span>
        <el-color-picker
          v-model="settings.background.mask.night"
          :predefine="predefineMaskColor"
          @change="
            () => {
              if (settings.background.mask.night === null) {
                settings.background.mask.night = '#000'
              }
            }
          "
        />
      </span>
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">
        {{ t('background.enableOnlineWallpaperCache') }}
        <cloud-off-round />
      </div>
      <el-switch
        v-model="settings.background.online.cacheEnable"
        :disabled="settings.background.bgType !== BgType.Online"
        :before-change="beforeCacheChange"
      />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.cache.noExpires') }}</div>
      <el-switch
        v-model="settings.background.online.noExpires"
        :disabled="!settings.background.online.cacheEnable"
      />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('background.cache.duration') }}</div>
      <el-input-number
        v-model="settings.background.online.cacheDuration"
        :disabled="
          settings.background.bgType !== BgType.Online ||
          !settings.background.online.cacheEnable ||
          settings.background.online.noExpires
        "
        :step="0.1"
        :min="0.1"
        style="width: 150px"
      >
        <template #suffix>
          <span>{{ t('common.hour') }}</span>
        </template>
      </el-input-number>
    </div>
  </div>
</template>
