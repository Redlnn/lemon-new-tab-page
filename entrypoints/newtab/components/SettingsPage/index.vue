<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

import { ArrowBackRound, CloseRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { useDialog } from '@/entrypoints/newtab/composables/useDialog'

import { type SettingsRoute, useSettingsRouter } from '@newtab/composables/useSettingsRouter'

import SettingsDetailView from './components/SettingsDetailView.vue'
import SettingsDialog from './components/SettingsDialog.vue'
import SettingsMenuView from './components/SettingsMenuView.vue'

// Constants
const MOBILE_BREAKPOINT = 650
const COLLAPSE_BREAKPOINT = 900
const DESKTOP_DIALOG_WIDTH = 900

interface MenuItem {
  key: SettingsRoute
  titleKey: string
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'theme', titleKey: 'newtab:settings.theme.title' },
  { key: 'clock', titleKey: 'newtab:settings.clock.title' },
  { key: 'search', titleKey: 'newtab:settings.search.title' },
  { key: 'background', titleKey: 'newtab:settings.background.title' },
  { key: 'shortcut', titleKey: 'newtab:settings.shortcut.title' },
  { key: 'yiyan', titleKey: 'newtab:settings.yiyan.title' },
  { key: 'performance', titleKey: 'newtab:settings.perf.title' },
  { key: 'other', titleKey: 'newtab:settings.other.title' }
]

const { t } = useTranslation()
const router = useSettingsRouter()
const { width: windowWidth } = useWindowSize()
const { opened, show, hide, toggle } = useDialog()

const detailViewRef = ref<InstanceType<typeof SettingsDetailView>>()
const isTransitioning = ref(false)

// Computed
const isMobile = computed(() => windowWidth.value < MOBILE_BREAKPOINT)
const isCollapse = computed(() => windowWidth.value < COLLAPSE_BREAKPOINT && !isMobile.value)

const dialogWidth = computed(() => (windowWidth.value < 950 ? '93%' : DESKTOP_DIALOG_WIDTH))

const currentPageTitle = computed(() => {
  if (router.isAtMenu.value) return t('newtab:settings.title')
  const item = MENU_ITEMS.find((i) => i.key === router.currentRoute.value)
  return item ? t(item.titleKey) : t('newtab:settings.title')
})

const titleIsVisible = computed(() => detailViewRef.value?.titleIsVisible ?? false)

const activeMenuKey = computed(() =>
  router.isAtMenu.value ? 'menu' : (router.currentRoute.value as string)
)

const slideTransitionName = computed(() =>
  isMobile.value ? (router.isForward.value ? 'slide-left' : 'slide-right') : ''
)

// Methods
const resetRouter = () => router.reset(isMobile.value ? 'menu' : 'theme')

function customShow() {
  resetRouter()
  show()
}

function customToggle() {
  if (!opened.value) resetRouter()
  toggle()
}

const handleMenuSelect = (key: string) => router.push(key as SettingsRoute)
const handleMobileBack = () => router.push('menu')

// Transition handlers
const handleTransitionStart = () => (isTransitioning.value = true)
const handleTransitionEnd = () => (isTransitioning.value = false)

// Watchers
watch(windowWidth, (newWidth, oldWidth) => {
  if (oldWidth) {
    const wasMobile = oldWidth < MOBILE_BREAKPOINT
    const isNowMobile = newWidth < MOBILE_BREAKPOINT
    if (wasMobile !== isNowMobile) resetRouter()
  }
})

// Lifecycle
onMounted(resetRouter)

defineExpose({ show: customShow, hide, toggle: customToggle })
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
    @closed="resetRouter"
  >
    <template #header="{ close, titleId }">
      <div
        v-show="!(isMobile && (router.isAtMenu.value || isTransitioning))"
        :id="titleId"
        class="base-dialog-title"
        :style="{ opacity: titleIsVisible ? 0 : 1 }"
      >
        {{ currentPageTitle }}
      </div>
      <span
        v-show="isMobile && !router.isAtMenu.value"
        class="mobile-back-btn"
        @click="handleMobileBack"
      >
        <el-icon color="currentColor" :size="20">
          <component :is="ArrowBackRound" />
        </el-icon>
      </span>
      <span class="base-dialog-close-btn" @click="close">
        <component :is="CloseRound" />
      </span>
    </template>

    <template #aside>
      <settings-menu-view
        v-if="!isMobile"
        :is-collapse="isCollapse"
        :active-key="activeMenuKey"
        @select="handleMenuSelect"
      />
    </template>

    <Transition
      v-if="isMobile"
      :name="slideTransitionName"
      mode="out-in"
      @before-leave="handleTransitionStart"
      @after-enter="handleTransitionEnd"
    >
      <settings-menu-view
        v-if="router.isAtMenu.value"
        key="menu"
        is-mobile
        :active-key="activeMenuKey"
        @select="handleMenuSelect"
      />
      <settings-detail-view
        v-else
        key="detail"
        ref="detailViewRef"
        is-mobile
        disable-transition
        :current-route="router.currentRoute.value"
        :title="currentPageTitle"
      />
    </Transition>

    <settings-detail-view
      v-else
      ref="detailViewRef"
      :current-route="router.currentRoute.value"
      :title="currentPageTitle"
    />
  </SettingsDialog>
</template>

<style lang="scss">
@use '@newtab/styles/mixins/acrylic.scss' as acrylic;

.settings__dialog {
  display: flex;
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
    flex: 1;
    flex-direction: column;
    background-color: var(--el-bg-color-overlay);

    html.dialog-transparent & {
      background-color: var(--le-bg-color-overlay-opacity-20);
    }
  }
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
    line-height: 1;
  }

  .mobile-back-btn {
    position: absolute;
    top: 15px;
    left: 20px;
    width: 20px;
    height: 20px;
    line-height: 1;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: color var(--el-transition-duration-fast);

    &:hover {
      color: var(--el-text-color-primary);
    }
  }
}

// Mobile slide transitions
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all var(--el-transition-duration-fast) cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-leave-to,
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30%);
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
