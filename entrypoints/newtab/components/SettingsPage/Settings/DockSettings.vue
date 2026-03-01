<script setup lang="ts">
import { RestoreRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import { blockedTopSitesStorage } from '@newtab/shared/storages/topSitesStorage'

const { t } = useTranslation('settings')

const settings = useSettingsStore()

async function restoreDefaultTopSites() {
  await blockedTopSitesStorage.setValue([])
  location.reload()
}
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:common.enable') }}</div>
      <el-switch v-model="settings.dock.enabled" />
    </div>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('shortcut.showOnSearchFocus') }}</div>
      <el-switch v-model="settings.dock.showOnSearchFocus" />
    </div>
    <div v-show="settings.dock.enabled" style="margin-top: 8px">
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('shortcut.showTopSites') }}</div>
        <el-switch v-model="settings.dock.enableTopSites" />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('common.openInNewTab') }}</div>
        <el-switch v-model="settings.dock.openInNewTab" />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('dock.limitCount') }}</div>
        <el-switch v-model="settings.dock.limitCount" />
      </div>
      <div v-if="settings.dock.limitCount" class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('dock.maxCount') }}</div>
        <el-slider
          v-model="settings.dock.maxCount"
          :min="1"
          :max="20"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('shortcut.iconSize') }}</div>
        <el-slider
          v-model="settings.dock.iconSize"
          :min="30"
          :max="64"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('shortcut.iconRatio') }}</div>
        <el-slider
          v-model="settings.dock.iconRatio"
          :min="0.1"
          :max="1"
          :step="0.05"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">
          {{ t('shortcut.HorizontalIconSpacing') }}
        </div>
        <el-slider
          v-model="settings.dock.gap"
          :min="3"
          :max="10"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('shortcut.restoreDefault') }}</div>
        <el-popconfirm
          width="220"
          :confirm-button-text="t('newtab:common.confirm')"
          :cancel-button-text="t('newtab:common.no')"
          :icon="RestoreRound"
          icon-color="#626AEF"
          :title="t('shortcut.restoreDefaultTitle')"
          @confirm="restoreDefaultTopSites()"
        >
          <template #reference>
            <el-button :icon="RestoreRound" circle />
          </template>
        </el-popconfirm>
      </div>
    </div>
  </div>
</template>
