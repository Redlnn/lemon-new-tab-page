<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

import { ArrowBackRound, CloseRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { useDialog } from '@/entrypoints/newtab/composables/useDialog'

import { type SettingsRoute, useSettingsRouter } from '@newtab/composables/useSettingsRouter'

import SettingsDetailView from './components/SettingsDetailView.vue'
import SettingsDialog from './components/SettingsDialog.vue'
import SettingsMenuView from './components/SettingsMenuView.vue'

const { t } = useTranslation()
const router = useSettingsRouter()
const { width: windowWidth } = useWindowSize()

const detailViewRef = ref<InstanceType<typeof SettingsDetailView>>()

const { opened, show, hide, toggle } = useDialog()

// Track if mobile transition animation is in progress
const isTransitioning = ref(false)

// Responsive breakpoint
const isMobile = computed(() => windowWidth.value < 650)

// Menu collapse state
const isCollapse = ref(false)

// Menu items configuration
interface MenuItem {
  key: SettingsRoute
  titleKey: string
}

const menuItems: MenuItem[] = [
  { key: 'theme', titleKey: 'newtab:settings.theme.title' },
  { key: 'clock', titleKey: 'newtab:settings.clock.title' },
  { key: 'search', titleKey: 'newtab:settings.search.title' },
  { key: 'background', titleKey: 'newtab:settings.background.title' },
  { key: 'shortcut', titleKey: 'newtab:settings.shortcut.title' },
  { key: 'yiyan', titleKey: 'newtab:settings.yiyan.title' },
  { key: 'performance', titleKey: 'newtab:settings.perf.title' },
  { key: 'other', titleKey: 'newtab:settings.other.title' }
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

// Title visibility for header
const titleIsVisible = computed(() => detailViewRef.value?.titleIsVisible ?? false)

// Active menu key
const activeMenuKey = computed(() =>
  router.isAtMenu.value ? 'menu' : (router.currentRoute.value as string)
)

// Slide transition name based on navigation direction
const slideTransitionName = computed(() => {
  if (!isMobile.value) return ''
  return router.isForward.value ? 'slide-left' : 'slide-right'
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

// Transition animation handlers for mobile
function handleTransitionStart() {
  isTransitioning.value = true
}

function handleTransitionEnd() {
  isTransitioning.value = false
}
</script>

<template>
  <SettingsDialog
    v-model="opened"
    :width="dialogWidth"
    class="settings__dialog settings-container--two-column"
    :class="[
      { 'is-mobile': isMobile },
      { 'is-mobile-main-menu': isMobile && router.isAtMenu.value }
    ]"
    lock-scroll
    draggable
    :show-close="false"
    header-class="settings-header noselect"
    @closed="handleClose"
  >
    <template #header="{ close, titleId }">
      <!-- 必须标题在第一个，否则渲染顺序会让按钮按不到 -->
      <!-- 标题：移动端设置首页不显示 -->
      <div
        v-show="!(isMobile && (router.isAtMenu.value || isTransitioning))"
        :id="titleId"
        class="base-dialog-title"
        :style="{ opacity: !titleIsVisible ? 1 : 0 }"
      >
        {{ currentPageTitle }}
      </div>
      <!-- 移动端返回按钮 -->
      <span
        v-show="isMobile && !router.isAtMenu.value"
        class="mobile-back-btn"
        @click="handleMobileBack"
      >
        <el-icon color="currentColor" :size="20">
          <component :is="ArrowBackRound" />
        </el-icon>
      </span>
      <!-- 关闭按钮 -->
      <span class="base-dialog-close-btn" @click="close">
        <component :is="CloseRound" />
      </span>
    </template>

    <template #aside>
      <!-- 仅在桌面模式展示侧边栏 -->
      <settings-menu-view
        v-if="!isMobile"
        :is-collapse="isCollapse"
        :active-key="activeMenuKey"
        @select="handleMenuSelect"
      />
    </template>

    <!-- 移动端：侧边栏变为满屏使用滑动过渡到二级页面 -->
    <Transition
      v-if="isMobile"
      :name="slideTransitionName"
      @before-leave="handleTransitionStart"
      @after-enter="handleTransitionEnd"
      mode="out-in"
    >
      <!-- 原侧边栏 -->
      <settings-menu-view
        v-if="router.isAtMenu.value"
        key="menu"
        :is-mobile="true"
        :active-key="activeMenuKey"
        @select="handleMenuSelect"
      />
      <!-- 二级页面 -->
      <settings-detail-view
        v-else
        key="detail"
        ref="detailViewRef"
        :current-route="router.currentRoute.value"
        :title="currentPageTitle"
        :is-mobile="true"
        :disable-transition="true"
      />
    </Transition>

    <!-- 桌面模式下永远展示内容区域 -->
    <settings-detail-view
      v-else
      ref="detailViewRef"
      :current-route="router.currentRoute.value"
      :title="currentPageTitle"
      :disable-transition="false"
    />
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

// Slide transitions for mobile navigation
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30%);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-enter-active,
.slide-right-enter-active {
  position: relative;
  z-index: 2;
}

.slide-left-leave-active,
.slide-right-leave-active {
  position: absolute;
  top: 50px;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}
</style>
