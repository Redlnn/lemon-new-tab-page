<script setup lang="ts">
import { useElementVisibility, useWindowSize } from '@vueuse/core'

import {
  AppstoreOutlined,
  ClockCircleOutlined,
  ControlOutlined,
  PictureOutlined,
  SearchOutlined
} from '@vicons/antd'
import {
  ApiRound,
  ArrowBackRound,
  ChevronRightRound,
  CloseRound,
  ColorLensOutlined,
  FormatQuoteRound
} from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import Icon from '@/assets/icon.svg?component'
import { useDialog } from '@/entrypoints/newtab/composables/useDialog'

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
const { width: windowWidth } = useWindowSize()
const titleRef = ref<HTMLDivElement>()
const titleIsVisible = useElementVisibility(titleRef)

const { opened, show, hide, toggle } = useDialog()

// Responsive breakpoint
const isMobile = computed(() => windowWidth.value < 650)

// Menu collapse state
const isCollapse = ref(false)

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

// Reset router when dialog is closed
function handleClose() {
  router.reset(isMobile.value ? 'menu' : 'theme')
}

// Custom show function that also resets router
function customShow() {
  router.reset(isMobile.value ? 'menu' : 'theme')
  show()
}

// Custom toggle function that also resets router when opening
function customToggle() {
  if (!opened.value) {
    router.reset(isMobile.value ? 'menu' : 'theme')
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

// Handle mobile back button
function handleMobileBack() {
  if (isMobile.value) {
    router.push('menu')
  }
}

// Get current page title
const currentPageTitle = computed(() => {
  if (router.isAtMenu.value) {
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

// Watch for responsive breakpoint changes
watch(windowWidth, (newWidth, oldWidth) => {
  // Update collapse state
  isCollapse.value = newWidth < 900 && newWidth >= 650

  // Handle transition between mobile and desktop
  if (oldWidth) {
    const wasMobile = oldWidth < 650
    const isNowMobile = newWidth < 650

    if (wasMobile !== isNowMobile) {
      // Transition between mobile and desktop
      router.reset(isNowMobile ? 'menu' : 'theme')
    }
  }
})

// Initialize router state based on initial viewport size
onMounted(() => {
  router.reset(isMobile.value ? 'menu' : 'theme')
})
</script>

<template>
  <SettingsDialog
    v-model="opened"
    :width="dialogWidth"
    class="settings__dialog settings-container--two-column"
    lock-scroll
    draggable
    :show-close="false"
    header-class="settings-header noselect"
    @closed="handleClose"
  >
    <template #header="{ close, titleId }">
      <div
        v-if="!(isMobile && router.isAtMenu.value)"
        :id="titleId"
        class="base-dialog-title"
        :style="{ opacity: !titleIsVisible ? 1 : 0 }"
      >
        {{ currentPageTitle }}
      </div>
      <!-- Mobile back button -->
      <span
        v-if="isMobile && !router.isAtMenu.value"
        class="mobile-back-btn"
        @click="handleMobileBack"
      >
        <el-icon color="currentColor" :size="20">
          <component :is="ArrowBackRound" />
        </el-icon>
      </span>
      <span
        class="base-dialog-close-btn"
        :class="{ 'is-mobile-main-menu': isMobile && router.isAtMenu.value }"
        @click="close"
      >
        <component :is="CloseRound" />
      </span>
    </template>
    <template #aside>
      <!-- Desktop: Always show menu; Mobile: Show only when at menu route -->
      <aside
        v-show="!isMobile || router.isAtMenu.value"
        class="settings-aside"
        :class="[{ 'is-mobile': isMobile }]"
      >
        <el-menu
          :default-active="router.isAtMenu.value ? 'theme' : router.currentRoute.value"
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
    <!-- Main content area -->
    <!-- Desktop: Always show; Mobile: Show only when not at menu route -->
    <el-main
      v-show="!isMobile || !router.isAtMenu.value"
      class="settings-main"
      :class="{ 'is-mobile': isMobile }"
    >
      <el-scrollbar class="settings-content">
        <h2 ref="titleRef" class="settings-content__title">{{ currentPageTitle }}</h2>
        <Transition name="settings-fade" mode="out-in">
          <theme-settings v-if="router.currentRoute.value === 'theme'" key="theme" />
          <clock-settings v-else-if="router.currentRoute.value === 'clock'" key="clock" />
          <search-settings v-else-if="router.currentRoute.value === 'search'" key="search" />
          <background-settings
            v-else-if="router.currentRoute.value === 'background'"
            key="background"
          />
          <shortcut-settings v-else-if="router.currentRoute.value === 'shortcut'" key="shortcut" />
          <yiyan-settings v-else-if="router.currentRoute.value === 'yiyan'" key="yiyan" />
          <performance-settings
            v-else-if="router.currentRoute.value === 'performance'"
            key="performance"
          />
          <other-settings v-else-if="router.currentRoute.value === 'other'" key="other" />
        </Transition>
      </el-scrollbar>
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
    background-color: var(--el-bg-color-overlay);

    html.dialog-transparent & {
      background-color: var(--le-bg-color-overlay-opacity-20);
    }
  }
}

.settings-container--two-column {
  display: flex;
}

.settings-header {
  position: relative;
  flex-shrink: 0;
  height: 50px;
  font-weight: bold;
  line-height: 50px;
  color: var(--el-text-color-primary);
  text-align: center;
  cursor: move;

  .base-dialog-close-btn {
    width: 20px;
    line-height: 1em;

    &.is-mobile-main-menu {
      left: -40px;
    }
  }

  .mobile-back-btn {
    position: absolute;
    top: 15px;
    left: 20px;
    width: 20px;
    height: 20px;
    line-height: 1em;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: color var(--el-transition-duration-fast);

    &:hover {
      color: var(--el-text-color-primary);
    }
  }
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

  .is-mobile & .settings-menu__icon {
    padding: 31px 20px 10px;
    font-size: 25px;
    line-height: 36px;
  }

  .settings-menu__icon:has(.el-icon) {
    padding: 16px 20px 25px;
  }

  &.el-menu--collapse .settings-menu__icon:has(.el-icon) {
    padding: 16px 14px 25px;
  }

  &:not(.el-menu--collapse) {
    width: 230px;
  }

  html.dialog-transparent & {
    background-color: var(--le-fill-color-dark-opacity-20);
  }

  html.dark & {
    background-color: var(--el-fill-color-lighter);
  }

  .is-mobile &:not(.el-menu--collapse) {
    width: 100%;
  }

  html.dark.dialog-transparent & {
    background-color: var(--le-fill-color-lighter-opacity-20);
  }

  &-item {
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

  .menu-switch {
    margin-left: 8px;
  }
}

.settings-main {
  padding: 0 20px 0 30px;

  .settings-content {
    height: 100%;

    .el-scrollbar__wrap {
      padding-right: 10px;
    }

    &__title {
      padding: 0 10px;
      margin: 25px 0 20px;
      font-size: 28px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
}

.settings-fade-enter-active,
.settings-fade-leave-active {
  transition: opacity 0.15s ease;
}

.settings-fade-enter-from,
.settings-fade-leave-to {
  opacity: 0;
}
</style>
