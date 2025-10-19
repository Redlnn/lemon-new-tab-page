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

import type { SettingsRoute } from '../composables/useSettingsRouter'

const { t } = useTranslation()

interface MenuItem {
  key: SettingsRoute
  icon: Component
  titleKey: string
}

const menuItems: MenuItem[] = [
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
    titleKey: 'newtab:settings.shortcut.title'
  },
  {
    key: 'yiyan',
    icon: FormatQuoteRound,
    titleKey: 'newtab:settings.yiyan.title'
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
        <span v-else>{{ t('newtab:settings.title') }}</span>
      </div>
      <el-menu-item
        v-for="item in menuItems"
        :key="item.key"
        :index="item.key"
        class="settings-menu-item"
      >
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <span class="menu-title">{{ t(item.titleKey) }}</span>
        <!-- Mobile: Show chevron arrow -->
        <el-icon v-if="isMobile" class="menu-chevron">
          <component :is="ChevronRightRound" />
        </el-icon>
      </el-menu-item>
    </el-menu>
  </aside>
</template>
