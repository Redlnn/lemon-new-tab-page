<script setup lang="ts">
import { AppstoreOutlined } from '@vicons/antd'
import { RestoreRound } from '@vicons/material'

import { blockedTopStitesStorage } from '@/entrypoints/newtab/js/store/topSitesStore'
import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/entrypoints/newtab/js/store/settingsStore'

const isChrome = import.meta.env.CHROME || import.meta.env.EDGE
const settingsStore = useSettingsStore()

async function restoreDefaultTopSites() {
  await blockedTopStitesStorage.setValue([])
  location.reload()
}
</script>

<template>
  <h3 class="settings-title">
    <el-icon><appstore-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.quickstart.title') }}</span>
  </h3>
  <div class="settings-item horizontal">
    <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.enable') }}</div>
    <el-switch v-model="settingsStore.quickStart.enabled" size="large" />
  </div>
  <div class="settings-item horizontal">
    <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.show_tops') }}</div>
    <el-switch v-model="settingsStore.quickStart.enableTopSites" size="large" />
  </div>
  <div class="settings-item horizontal">
    <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.enable_qs_bg') }}</div>
    <el-switch v-model="settingsStore.quickStart.showQuickStartContainerBg" size="large" />
  </div>
  <div class="settings-item horizontal">
    <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.show_pinned_icon') }}</div>
    <el-switch v-model="settingsStore.quickStart.showPinnedIcon" size="large" />
  </div>
  <div class="settings-item horizontal">
    <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.show_title') }}</div>
    <el-switch v-model="settingsStore.quickStart.showQuickStartTitle" size="large" />
  </div>
  <div class="settings-item">
    <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.max_rows') }}</div>
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
    <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.max_columns') }}</div>
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
    {{ i18n.t('newtab.settings.quickstart.max_items_tip_chrome') }}
  </p>
  <div class="settings-item quickstart-item-width">
    <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.link_width') }}</div>
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
    <div class="settings-label">{{ i18n.t('newtab.settings.quickstart.restore_default') }}</div>
    <el-popconfirm
      width="220"
      :confirm-button-text="i18n.t('newtab.settings.quickstart.restore_default_confirm.confirm')"
      :cancel-button-text="i18n.t('newtab.settings.quickstart.restore_default_confirm.cancel')"
      :icon="RestoreRound"
      icon-color="#626AEF"
      :title="i18n.t('newtab.settings.quickstart.restore_default_confirm.title')"
      @confirm="restoreDefaultTopSites()"
    >
      <template #reference>
        <el-button :icon="RestoreRound" circle />
      </template>
    </el-popconfirm>
  </div>
</template>

<style scoped lang="scss">
.quickstart-item-width:deep() .el-input-number,
.quickstart-item-width:deep() .el-input {
  width: 60px;
}
</style>
