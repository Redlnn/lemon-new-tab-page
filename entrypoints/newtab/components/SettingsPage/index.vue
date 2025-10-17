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

import { useDialog } from '@/entrypoints/newtab/composables/useDialog'
import { useSettingsStore } from '@/shared/settings'

import { type SettingsRoute, useSettingsRouter } from '@newtab/composables/useSettingsRouter'

import SettingsDialog from './components/SettingsDialog.vue'
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
const isMobile = computed(() => windowWidth.value < 650)

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
  if (windowWidth.value < 950) {
    return '93%'
  }
  return 900
})

watch(windowWidth, () => {
  isCollapse.value = windowWidth.value < 900 && windowWidth.value >= 650
})
</script>

<template>
  <SettingsDialog
    v-model="opened"
    :width="dialogWidth"
    class="settings__dialog settings-container--two-column"
    lock-scroll
    draggable
    header-class="settings-header noselect"
    @closed="handleClose"
  >
    <template #aside>
      <!-- Sidebar menu - hidden on mobile when not on menu route -->
      <aside
        v-show="!isMobile || router.currentRoute.value === 'menu'"
        class="settings-aside"
        :class="[{ 'is-mobile': isMobile }]"
      >
        <el-menu
          :default-active="router.currentRoute.value"
          :collapse="isCollapse"
          :collapse-transition="!isMobile"
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
                @change="(value) => item.onSwitchChange?.(value as boolean)"
              />
            </template>
          </el-menu-item>
        </el-menu>
      </aside>
    </template>
    <!-- Main content area -->
    <el-main v-show="!isMobile || router.currentRoute.value !== 'menu'" class="settings-main">
      <div class="settings-content">
        <el-scrollbar>
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
        </el-scrollbar>
      </div>
    </el-main>
  </SettingsDialog>
</template>

<style lang="scss">
@use '@newtab/styles/mixins/acrylic.scss' as acrylic;

.settings__dialog {
  height: 500px;
  padding: 0;
  overflow: hidden;
  background-color: transparent;
  border-radius: 10px;
  box-shadow: 0 0 15px 0 var(--le-bg-color-page-opacity-60);

  transition:
    background-color var(--el-transition-duration-fast) ease,
    box-shadow var(--el-transition-duration-fast) ease;

  html.dialog-acrylic & {
    @include acrylic.acrylic;
  }

  .el-dialog__body {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    background-color: var(--le-bg-color-overlay);

    html.dialog-transparent & {
      background-color: var(--le-bg-color-overlay-opacity-20);
    }
  }
}

.settings-container--two-column {
  display: flex;
}

.settings-header {
  flex-shrink: 0;
  height: 40px;
}

.settings-aside {
  flex-shrink: 0;
  min-width: 64px;
  height: 100%;

  &.is-mobile {
    min-width: 100%;
  }
}

.settings-menu {
  height: 100%;
  background-color: #e9e9e9;

  &:not(.el-menu--collapse) {
    width: 230px;
  }

  html.dialog-transparent & {
    background-color: rgb(233 233 233 / 80%);
  }

  .is-mobile &:not(.el-menu--collapse) {
    width: 100%;
  }

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
}

.settings-content {
  height: 100%;
  padding: 24px;

  .el-scrollbar__wrap {
    border-radius: 8px;
  }

  &__title {
    padding: 0 10px;
    margin: 0 0 20px;
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
</style>
