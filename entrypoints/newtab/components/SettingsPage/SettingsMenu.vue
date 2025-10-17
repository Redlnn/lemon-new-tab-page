<script setup lang="ts">
import { ArrowForwardIosRound } from '@vicons/material'
import {
  AppstoreOutlined,
  ClockCircleOutlined,
  ControlOutlined,
  PictureOutlined,
  SearchOutlined
} from '@vicons/antd'
import { ApiRound, ColorLensOutlined, FormatQuoteRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'
import { type Component } from 'vue'

import { useSettingsStore } from '@/shared/settings'

import { type SettingsRoute, useSettingsRouter } from '@newtab/composables/useSettingsRouter'

const { t } = useTranslation()
const settings = useSettingsStore()
const router = useSettingsRouter()

interface SettingsMenuItem {
  key: SettingsRoute
  icon: Component
  titleKey: string
  hasSwitch?: boolean
  switchValue?: () => boolean
  onSwitchChange?: (value: boolean) => void
}

const menuItems: SettingsMenuItem[] = [
  {
    key: 'theme',
    icon: ColorLensOutlined,
    titleKey: 'newtab:settings.theme.title'
  },
  {
    key: 'clock',
    icon: ClockCircleOutlined,
    titleKey: 'newtab:settings.clock.title'
  },
  {
    key: 'search',
    icon: SearchOutlined,
    titleKey: 'newtab:settings.search.title'
  },
  {
    key: 'background',
    icon: PictureOutlined,
    titleKey: 'newtab:settings.background.title'
  },
  {
    key: 'shortcut',
    icon: AppstoreOutlined,
    titleKey: 'newtab:settings.shortcut.title',
    hasSwitch: true,
    switchValue: () => settings.shortcut.enabled,
    onSwitchChange: (value: boolean) => {
      settings.shortcut.enabled = value
    }
  },
  {
    key: 'yiyan',
    icon: FormatQuoteRound,
    titleKey: 'newtab:settings.yiyan.title',
    hasSwitch: true,
    switchValue: () => settings.yiyan.enabled,
    onSwitchChange: (value: boolean) => {
      settings.yiyan.enabled = value
    }
  },
  {
    key: 'performance',
    icon: ApiRound,
    titleKey: 'newtab:settings.perf.title'
  },
  {
    key: 'other',
    icon: ControlOutlined,
    titleKey: 'newtab:settings.other.title'
  }
]

function handleItemClick(item: SettingsMenuItem) {
  router.push(item.key)
}

function handleSwitchClick(event: Event) {
  event.stopPropagation()
}
</script>

<template>
  <div class="settings-menu">
    <div
      v-for="item in menuItems"
      :key="item.key"
      class="settings-menu__item"
      @click="handleItemClick(item)"
    >
      <div class="settings-menu__item-left">
        <el-icon class="settings-menu__item-icon">
          <component :is="item.icon" />
        </el-icon>
        <span class="settings-menu__item-title">{{ t(item.titleKey) }}</span>
      </div>
      <div class="settings-menu__item-right">
        <el-switch
          v-if="item.hasSwitch && item.switchValue && item.onSwitchChange"
          :model-value="item.switchValue()"
          @click="handleSwitchClick($event)"
          @change="item.onSwitchChange"
        />
        <el-icon class="settings-menu__item-arrow">
          <arrow-forward-ios-round />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-menu {
  padding: 16px 0;

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &:active {
      background-color: var(--el-fill-color);
    }

    &-left {
      display: flex;
      gap: 16px;
      align-items: center;
      flex: 1;
    }

    &-icon {
      font-size: 20px;
      color: var(--el-text-color-primary);
    }

    &-title {
      font-size: 16px;
      color: var(--el-text-color-primary);
    }

    &-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    &-arrow {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
