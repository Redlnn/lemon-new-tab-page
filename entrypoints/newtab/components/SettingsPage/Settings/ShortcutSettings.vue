<script setup lang="ts">
import { RestoreRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

import { blockedTopSitesStorage } from '@newtab/shared/storages/topSitesStorage'

const { t } = useTranslation('settings')

const isChrome = import.meta.env.CHROME || import.meta.env.EDGE
const settings = useSettingsStore()

async function restoreDefaultTopSites() {
  await blockedTopSitesStorage.setValue([])
  location.reload()
}
</script>

<template>
  <div class="settings__items-container">
    <p v-if="isChrome" class="settings__item--note" style="margin-top: 1em">
      {{ t('shortcut.tip') }}
    </p>
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('newtab:common.enable') }}</div>
      <el-switch v-model="settings.shortcut.enabled" />
    </div>
    <div v-show="settings.shortcut.enabled" style="margin-top: 8px">
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('shortcut.showTopSites') }}</div>
        <el-switch v-model="settings.shortcut.enableTopSites" />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('shortcut.enableBg') }}</div>
        <el-switch v-model="settings.shortcut.showShortcutContainerBg" />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('shortcut.enableAreaShadow') }}</div>
        <el-switch
          v-model="settings.shortcut.enableAreaShadow"
          :disabled="!settings.shortcut.showShortcutContainerBg"
        />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('shortcut.enableShadow') }}</div>
        <el-switch v-model="settings.shortcut.enableShadow" />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('shortcut.showPinnedIcon') }}</div>
        <el-switch
          :disabled="!settings.shortcut.enableTopSites"
          v-model="settings.shortcut.showPinnedIcon"
        />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('shortcut.showTitle') }}</div>
        <el-switch v-model="settings.shortcut.showShortcutTitle" />
      </div>
      <div class="settings__item settings__item--horizontal">
        <div class="settings__label">{{ t('common.openInNewTab') }}</div>
        <el-switch v-model="settings.shortcut.openInNewTab" />
      </div>
      <p class="settings__item--note">
        {{ t('shortcut.whiteTextTip') }}
      </p>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('shortcut.maxRows') }}</div>
        <el-slider
          v-model="settings.shortcut.rows"
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
        <div class="settings__label">{{ t('shortcut.maxColumns') }}</div>
        <el-slider
          v-model="settings.shortcut.columns"
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
        {{ t('shortcut.maxItemsTipForChrome') }}
      </p>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('shortcut.iconSize') }}</div>
        <el-slider
          v-model="settings.shortcut.iconSize"
          :min="10"
          :max="200"
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
          v-model="settings.shortcut.itemMarginH"
          :min="0"
          :max="50"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">
          {{ t('shortcut.VerticalIconSpacing') }}
        </div>
        <el-slider
          v-model="settings.shortcut.itemMarginV"
          :min="5"
          :max="30"
          show-input
          :show-input-controls="false"
          :show-tooltip="false"
        />
      </div>
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">
          {{ t('shortcut.marginTop') }}
        </div>
        <el-slider
          v-model="settings.shortcut.marginTop"
          :min="10"
          :max="150"
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
          :cancel-button-text="t('newtab:common.cancel')"
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
