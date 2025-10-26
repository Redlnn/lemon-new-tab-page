<script setup lang="ts">
import {
  AppstoreOutlined,
  ClockCircleOutlined,
  ControlOutlined,
  PictureOutlined,
  SearchOutlined
} from '@vicons/antd'
import { ApiRound, ChevronRightRound, ColorLensOutlined, FormatQuoteRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import Icon from '@/assets/icon.svg?component'

import { SettingsRoute } from '../composables/useSettingsRouter'

const { t } = useTranslation('settings')

interface MenuItem {
  key: SettingsRoute
  icon: Component
  titleKey: string
}

const menuItems: MenuItem[] = [
  {
    key: SettingsRoute.THEME,
    icon: ColorLensOutlined,
    titleKey: 'theme.title'
  },
  {
    key: SettingsRoute.CLOCK,
    icon: ClockCircleOutlined,
    titleKey: 'clock.title'
  },
  {
    key: SettingsRoute.SEARCH,
    icon: SearchOutlined,
    titleKey: 'search.title'
  },
  {
    key: SettingsRoute.BACKGROUND,
    icon: PictureOutlined,
    titleKey: 'background.title'
  },
  {
    key: SettingsRoute.SHORTCUT,
    icon: AppstoreOutlined,
    titleKey: 'shortcut.title'
  },
  {
    key: SettingsRoute.YIYAN,
    icon: FormatQuoteRound,
    titleKey: 'yiyan.title'
  },
  {
    key: SettingsRoute.PERFORMANCE,
    icon: ApiRound,
    titleKey: 'perf.title'
  },
  {
    key: SettingsRoute.OTHER,
    icon: ControlOutlined,
    titleKey: 'other.title'
  }
]

interface Props {
  isMobile?: boolean
  isCollapse?: boolean
  activeKey?: string
}

defineProps<Props>()

const emit = defineEmits<{
  select: [key: string]
}>()

function handleMenuSelect(key: string) {
  emit('select', key)
}
</script>

<template>
  <aside class="settings-aside">
    <el-menu
      :default-active="activeKey"
      :collapse="isCollapse"
      :collapse-transition="!isMobile"
      class="settings-menu"
      @select="handleMenuSelect"
    >
      <div class="settings-menu__icon">
        <el-icon v-if="!isMobile" :size="36">
          <Icon />
        </el-icon>
        <span v-else>{{ t('title') }}</span>
      </div>
      <el-menu-item
        v-for="item in menuItems"
        :key="item.key"
        :index="item.key"
        class="settings-menu-item noselect"
      >
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <template #title>
          <span class="menu-title">{{ t(item.titleKey) }}</span>
        </template>
        <!-- Mobile: Show chevron arrow -->
        <el-icon v-if="isMobile" class="menu-chevron">
          <component :is="ChevronRightRound" />
        </el-icon>
      </el-menu-item>
    </el-menu>
  </aside>
</template>
