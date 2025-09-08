<script setup lang="ts">
import { AppstoreOutlined } from '@vicons/antd'
import { RestoreRound } from '@vicons/material'

import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/shared/settings'

import { blockedTopStitesStorage } from '@newtab/scripts/storages/topSitesStorage'

const isChrome = import.meta.env.CHROME || import.meta.env.EDGE
const settingsStore = useSettingsStore()

async function restoreDefaultTopSites() {
  await blockedTopStitesStorage.setValue([])
  location.reload()
}
</script>

<template>
  <div class="settings__title">
    <el-icon><appstore-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.shortcut.title') }}</span>
  </div>
  <div class="settings__items-container">
    <p v-if="isChrome" class="settings__item--note" style="margin-top: 1em">
      {{ i18n.t('newtab.settings.shortcut.tip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.enable') }}</div>
      <el-switch v-model="settingsStore.shortcut.enabled" />
    </div>
    <div v-show="settingsStore.shortcut.enabled" style="margin-top: 8px">
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.showTopSites') }}</div>
        <el-switch v-model="settingsStore.shortcut.enableTopSites" />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.enableBg') }}</div>
        <el-switch v-model="settingsStore.shortcut.showShortcutContainerBg" />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.enableAreaShadow') }}</div>
        <el-switch
          v-model="settingsStore.shortcut.enableAreaShadow"
          :disabled="!settingsStore.shortcut.showShortcutContainerBg"
        />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.enableShadow') }}</div>
        <el-switch v-model="settingsStore.shortcut.enableShadow" />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.showPinnedIcon') }}</div>
        <el-switch
          :disabled="!settingsStore.shortcut.enableTopSites"
          v-model="settingsStore.shortcut.showPinnedIcon"
        />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.showTitle') }}</div>
        <el-switch v-model="settingsStore.shortcut.showShortcutTitle" />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">
          {{ i18n.t('newtab.settings.shortcut.whiteTextInLightMode') }}
        </div>
        <el-switch v-model="settingsStore.shortcut.whiteTextInLightMode" />
      </div>
      <p class="settings__item--note">
        {{ i18n.t('newtab.settings.shortcut.whiteTextTip') }}
      </p>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.maxRows') }}</div>
        <el-slider
          v-model="settingsStore.shortcut.rows"
          :step="1"
          :min="1"
          :max="5"
          show-stops
          :show-tooltip="false"
          style="margin-bottom: 20px"
          :marks="{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.maxColumns') }}</div>
        <el-slider
          v-model="settingsStore.shortcut.columns"
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
        style="
          margin-top: 0;
          font-size: var(--el-font-size-extra-small);
          line-height: 1.5em;
          color: var(--el-text-color-regular);
        "
      >
        {{ i18n.t('newtab.settings.shortcut.maxItemsTipForChrome') }}
      </p>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.iconSize') }}</div>
        <el-slider
          v-model="settingsStore.shortcut.iconSize"
          :min="10"
          :max="200"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">
          {{ i18n.t('newtab.settings.shortcut.HorizontalIconSpacing') }}
        </div>
        <el-slider
          v-model="settingsStore.shortcut.itemMarginH"
          :min="0"
          :max="50"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">
          {{ i18n.t('newtab.settings.shortcut.VerticalIconSpacing') }}
        </div>
        <el-slider
          v-model="settingsStore.shortcut.itemMarginV"
          :min="5"
          :max="30"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">
          {{ i18n.t('newtab.settings.shortcut.marginTop') }}
        </div>
        <el-slider
          v-model="settingsStore.shortcut.marginTop"
          :min="10"
          :max="150"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ i18n.t('newtab.settings.shortcut.restoreDefault') }}</div>
        <el-popconfirm
          width="220"
          :confirm-button-text="i18n.t('newtab.settings.shortcut.restoreDefaultConfirm.confirm')"
          :cancel-button-text="i18n.t('newtab.settings.shortcut.restoreDefaultConfirm.cancel')"
          :icon="RestoreRound"
          icon-color="#626AEF"
          :title="i18n.t('newtab.settings.shortcut.restoreDefaultConfirm.title')"
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

<style lang="scss">
.settings__item--vertical .el-input-number,
.settings__item--vertical .el-input {
  width: 60px;
}
</style>
