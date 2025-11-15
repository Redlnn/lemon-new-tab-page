<script lang="ts" setup>
import { HeartFilled } from '@vicons/antd'
import {
  AccessTimeFilledRound,
  HelpFilled,
  InfoRound,
  SearchRound,
  SettingsRound,
  WallpaperRound
} from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import { getPerfClasses } from '@newtab/composables/perfClasses'

const emit = defineEmits<{
  (e: 'open-settings'): void
  (e: 'open-changelog'): void
  (e: 'open-about'): void
  (e: 'open-search-engine-preference'): void
  (e: 'open-faq'): void
  (e: 'open-background-switcher'): void
}>()

const { t } = useTranslation()
const settings = useSettingsStore()

function sponsorMessage() {
  ElMessageBox.alert(t('sponsor'), t('newtab:menu.sponsor'), {
    closeOnPressEscape: true,
    closeOnClickModal: true
  })
}
</script>

<template>
  <el-dropdown
    style="display: block"
    :popper-class="
      getPerfClasses(
        {
          transparentOff: settings.perf.disableSettingsBtnTransparent,
          blurOff: settings.perf.disableSettingsBtnBlur
        },
        'setting-btn__popper'
      )
    "
    :show-arrow="false"
    placement="top-end"
    trigger="click"
    @contextmenu.prevent.stop
  >
    <div
      class="action-btn setting-btn"
      :class="{
        'action-btn--tran': !settings.perf.disableSettingsBtnTransparent,
        'action-btn--blur': !(
          settings.perf.disableSettingsBtnBlur || settings.perf.disableSettingsBtnTransparent
        )
      }"
    >
      <el-badge is-dot :offset="[3, 0]" :hidden="settings.readChangeLog">
        <el-icon><settings-round /></el-icon>
      </el-badge>
    </div>
    <template #dropdown>
      <el-dropdown-menu class="noselect">
        <el-dropdown-item @click="emit('open-settings')">
          <el-icon :size="17"><settings-round /></el-icon>
          <span>{{ t('settings:title') }}</span>
        </el-dropdown-item>
        <el-dropdown-item @click="emit('open-search-engine-preference')">
          <el-icon :size="17"><search-round /></el-icon>
          <span>{{ t('menu.searchEnginePreference') }}</span>
        </el-dropdown-item>
        <el-dropdown-item @click="emit('open-background-switcher')">
          <el-icon :size="17"><wallpaper-round /></el-icon>
          <span>{{ t('menu.backgroundPreference') }}</span>
        </el-dropdown-item>
        <el-badge is-dot :offset="[-3, 17]" :hidden="settings.readChangeLog" style="width: 100%">
          <el-dropdown-item divided @click="emit('open-changelog')">
            <el-icon :size="17"><access-time-filled-round /></el-icon>
            <span>{{ t('changelog.title') }}</span>
          </el-dropdown-item>
        </el-badge>
        <el-dropdown-item @click="emit('open-faq')">
          <el-icon :size="17"><help-filled /></el-icon>
          <span>{{ t('menu.help') }}</span>
        </el-dropdown-item>
        <el-dropdown-item @click="sponsorMessage">
          <el-icon :size="17"><heart-filled /></el-icon>
          <span>{{ t('menu.sponsor') }}</span>
        </el-dropdown-item>
        <el-dropdown-item divided @click="emit('open-about')">
          <el-icon :size="17"><info-round /></el-icon>
          <span>{{ t('menu.about') }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
