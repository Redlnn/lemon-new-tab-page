<script setup lang="ts">
import { AppstoreOutlined } from '@vicons/antd'
import { RestoreRound } from '@vicons/material'

import { blockedTopStitesStorage } from '@/newtab/scripts/storages/topSitesStorage'
import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/newtab/scripts/store/settingsStore'

const isChrome = import.meta.env.CHROME || import.meta.env.EDGE
const settingsStore = useSettingsStore()

async function restoreDefaultTopSites() {
  await blockedTopStitesStorage.setValue([])
  location.reload()
}
</script>

<template>
  <div class="settings-title">
    <el-icon><appstore-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.quickstart.title') }}</span>
  </div>
  <div class="setting-items-container">
    <p
      v-if="isChrome"
      style="color: var(--el-text-color-regular); line-height: 1em; font-size: 12px"
    >
      {{ i18n.t('newtab.settings.quickstart.tip') }}
    </p>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.enable') }}</div>
      <el-switch v-model="settingsStore.quickStart.enabled" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.showTopSites') }}</div>
      <el-switch v-model="settingsStore.quickStart.enableTopSites" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.enableQSBg') }}</div>
      <el-switch v-model="settingsStore.quickStart.showQuickStartContainerBg" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.showPinnedIcon') }}</div>
      <el-switch v-model="settingsStore.quickStart.showPinnedIcon" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.showTitle') }}</div>
      <el-switch v-model="settingsStore.quickStart.showQuickStartTitle" />
    </div>
    <div class="settings-item">
      <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.maxRows') }}</div>
      <el-slider
        v-model="settingsStore.quickStart.quickStartRows"
        :step="1"
        :min="1"
        :max="5"
        show-stops
        :show-tooltip="false"
        style="margin-bottom: 20px"
        :marks="{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }"
      />
    </div>
    <div class="settings-item">
      <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.maxColumns') }}</div>
      <el-slider
        v-model="settingsStore.quickStart.quickStartColumns"
        :step="1"
        :min="1"
        :max="10"
        show-stops
        :show-tooltip="false"
        style="margin-bottom: 20px"
        :marks="{ 1: '1', 10: '10' }"
      />
    </div>
    <p
      v-if="isChrome"
      style="color: var(--el-text-color-regular); line-height: 1.5em; font-size: 12px"
    >
      {{ i18n.t('newtab.settings.quickstart.maxItemsTipChrome') }}
    </p>
    <div class="settings-item quickstart-item-width">
      <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.linkWidth') }}</div>
      <el-slider
        v-model="settingsStore.quickStart.quickStartItemWidth"
        :min="80"
        :max="200"
        show-input
        :show-input-controls="false"
        :show-tooltip="false"
      />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.restoreDefault') }}</div>
      <el-popconfirm
        width="220"
        :confirm-button-text="i18n.t('newtab.settings.quickstart.restoreDefaultConfirm.confirm')"
        :cancel-button-text="i18n.t('newtab.settings.quickstart.restoreDefaultConfirm.cancel')"
        :icon="RestoreRound"
        icon-color="#626AEF"
        :title="i18n.t('newtab.settings.quickstart.restoreDefaultConfirm.title')"
        @confirm="restoreDefaultTopSites()"
      >
        <template #reference>
          <el-button :icon="RestoreRound" circle />
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<style scoped lang="scss">
.quickstart-item-width:deep() .el-input-number,
.quickstart-item-width:deep() .el-input {
  width: 60px;
}
</style>
