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

import type { SettingsRoute } from '@newtab/composables/useSettingsRouter'

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
        <span v-else>设置</span>
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

<style lang="scss" scoped>
.settings-aside {
  flex-shrink: 0;
  min-width: 64px;
  height: 100%;

  .is-mobile & {
    min-width: 100%;
  }
}

.settings-menu {
  height: 100%;
  background-color: #e9e9e9;

  &:not(.el-menu--collapse) {
    width: 230px;
  }

  .settings-menu__icon {
    &:has(.el-icon) {
      padding: 16px 20px 25px;
    }

    .is-mobile & {
      padding: 31px 20px 10px;
      font-size: 25px;
      line-height: 36px;
      color: var(--el-text-color-primary);
    }
  }

  &.el-menu--collapse .settings-menu__icon:has(.el-icon) {
    padding: 16px 14px 25px;
  }

  // Mobile override
  .is-mobile & {
    width: 100% !important;
    background-color: initial !important;
  }

  // Theme variants
  html.dark & {
    background-color: var(--el-fill-color-lighter);
  }

  html.dialog-transparent & {
    background-color: var(--le-fill-color-dark-opacity-20);
  }

  html.dark.dialog-transparent & {
    background-color: var(--le-fill-color-lighter-opacity-20);
  }

  // Menu item styles
  :deep(.settings-menu-item) {
    --el-menu-item-height: 36px;
    --el-menu-active-color: var(--el-color-primary);
    --el-menu-hover-bg-color: var(--le-fill-color-dark-opacity-20);

    &.is-active {
      background-color: var(--el-color-primary-light-9);
    }

    .menu-chevron {
      color: var(--el-text-color-secondary);
      transition: color var(--el-transition-duration-fast);
    }

    &:not(.is-active):hover .menu-chevron {
      color: var(--el-menu-text-color);
    }
  }

  .menu-title {
    flex: 1;
  }
}
</style>
