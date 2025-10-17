<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

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

import { useDialog } from '@/entrypoints/newtab/composables/useDialog'
import { useSettingsStore } from '@/shared/settings'

import BaseDialog from '@newtab/components/BaseDialog.vue'
import { type SettingsRoute, useSettingsRouter } from '@newtab/composables/useSettingsRouter'

import BackgroundSettings from './Settings/BackgroundSettings.vue'
import ClockSettings from './Settings/ClockSettings.vue'
import OtherSettings from './Settings/OtherSettings.vue'
import PerformanceSettings from './Settings/PerformanceSettings.vue'
import SearchSettings from './Settings/SearchSettings.vue'
import ShortcutSettings from './Settings/ShortcutSettings.vue'
import ThemeSettings from './Settings/ThemeSettings.vue'
import YiyanSettings from './Settings/YiyanSettings.vue'

const { t } = useTranslation()
const router = useSettingsRouter()
const settings = useSettingsStore()
const { width: windowWidth } = useWindowSize()

const { opened, show, hide, toggle } = useDialog()

// Responsive breakpoint
const isMobile = computed(() => windowWidth.value < 768)

// Menu collapse state
const isCollapse = ref(false)

interface MenuItem {
  key: SettingsRoute
  icon: Component
  titleKey: string
  hasSwitch?: boolean
  switchValue?: () => boolean
  onSwitchChange?: (value: boolean) => void
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

// Reset router when dialog is closed
function handleClose() {
  router.reset()
}

// Custom show function that also resets router
function customShow() {
  router.reset()
  show()
}

// Custom toggle function that also resets router when opening
function customToggle() {
  if (!opened.value) {
    router.reset()
  }
  toggle()
}

defineExpose({
  show: customShow,
  hide,
  toggle: customToggle
})

// Handle menu item click
function handleMenuSelect(key: string) {
  router.push(key as SettingsRoute)
}

// Handle switch click
function handleSwitchClick(event: Event) {
  event.stopPropagation()
}

// Get current page title
const currentPageTitle = computed(() => {
  if (router.currentRoute.value === 'menu') {
    return t('newtab:settings.title')
  }
  const item = menuItems.find((i) => i.key === router.currentRoute.value)
  return item ? t(item.titleKey) : t('newtab:settings.title')
})

// Dialog width
const dialogWidth = computed(() => {
  if (windowWidth.value < 768) {
    return '95%'
  }
  return 900
})
</script>

<template>
  <base-dialog
    v-model="opened"
    :title="t('newtab:settings.title')"
    :width="dialogWidth"
    container-class="settings__dialog settings__dialog--two-column"
    acrylic
    opacity
    @closed="handleClose"
  >
    <el-container class="settings-container">
      <!-- Sidebar menu - hidden on mobile when not on menu route -->
      <el-aside
        v-show="!isMobile || router.currentRoute.value === 'menu'"
        :width="isCollapse ? '64px' : '200px'"
        class="settings-aside"
      >
        <el-menu
          :default-active="router.currentRoute.value"
          :collapse="isCollapse"
          :collapse-transition="false"
          class="settings-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.key"
            :index="item.key"
            class="settings-menu-item"
          >
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <template #title>
              <span class="menu-title">{{ t(item.titleKey) }}</span>
              <el-switch
                v-if="item.hasSwitch && item.switchValue && item.onSwitchChange"
                :model-value="item.switchValue()"
                size="small"
                class="menu-switch"
                @click="handleSwitchClick($event)"
                @change="item.onSwitchChange"
              />
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- Main content area -->
      <el-main
        v-show="!isMobile || router.currentRoute.value !== 'menu'"
        class="settings-main"
      >
        <div class="settings-content">
          <h2 class="settings-content__title">{{ currentPageTitle }}</h2>
          <Transition name="settings-fade" mode="out-in">
            <theme-settings v-if="router.currentRoute.value === 'theme'" key="theme" />
            <clock-settings v-else-if="router.currentRoute.value === 'clock'" key="clock" />
            <search-settings v-else-if="router.currentRoute.value === 'search'" key="search" />
            <background-settings
              v-else-if="router.currentRoute.value === 'background'"
              key="background"
            />
            <shortcut-settings
              v-else-if="router.currentRoute.value === 'shortcut'"
              key="shortcut"
            />
            <yiyan-settings v-else-if="router.currentRoute.value === 'yiyan'" key="yiyan" />
            <performance-settings
              v-else-if="router.currentRoute.value === 'performance'"
              key="performance"
            />
            <other-settings v-else-if="router.currentRoute.value === 'other'" key="other" />
          </Transition>
        </div>
      </el-main>
    </el-container>
  </base-dialog>
</template>

<style lang="scss">
.settings__dialog--two-column {
  .base-dialog-container {
    padding: 0;
  }

  .base-dialog-scrollbar {
    padding: 0;
  }

  .base-dialog-list-title {
    display: none;
  }

  .base-dialog-bottom-spacing {
    display: none;
  }
}

.settings-container {
  height: 100%;
  min-height: 400px;
}

.settings-aside {
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s;
}

.settings-menu {
  border: none;
  height: 100%;

  &-item {
    position: relative;
  }

  .menu-title {
    flex: 1;
  }

  .menu-switch {
    margin-left: 8px;
  }
}

.settings-main {
  padding: 0;
  overflow-y: auto;
}

.settings-content {
  padding: 24px;

  &__title {
    margin: 0 0 20px 0;
    padding: 0 10px;
    font-size: 28px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.settings-fade-enter-active,
.settings-fade-leave-active {
  transition: opacity 0.2s ease;
}

.settings-fade-enter-from,
.settings-fade-leave-to {
  opacity: 0;
}

// Mobile layout adjustments
@media screen and (max-width: 767px) {
  .settings-aside {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .settings-main {
    width: 100%;
  }
}
</style>
