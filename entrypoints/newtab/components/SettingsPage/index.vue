<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

import { ArrowBackRound, CloseRound } from '@vicons/material'
import { useTranslation } from 'i18next-vue'

import { useDialog } from '@newtab/composables/useDialog'

import { prefetchSettingsView } from './components/settingsAsyncViews'
import SettingsDetailView from './components/SettingsDetailView.vue'
import SettingsDialog from './components/SettingsDialog.vue'
import SettingsMenuView from './components/SettingsMenuView.vue'
import { MENU_ITEMS, SettingsRoute, useSettingsRouter } from './composables/useSettingsRouter'

const MOBILE_BREAKPOINT = 650
const COLLAPSE_BREAKPOINT = 900
const DESKTOP_DIALOG_WIDTH = 900

const { t } = useTranslation('settings')
const router = useSettingsRouter()
const { width: windowWidth } = useWindowSize()
const { opened, show, hide, toggle } = useDialog()

const detailViewRef = ref<InstanceType<typeof SettingsDetailView>>()
const isTransitioning = ref(false)

const isMobile = computed(() => windowWidth.value < MOBILE_BREAKPOINT)
const isCollapse = computed(() => windowWidth.value < COLLAPSE_BREAKPOINT && !isMobile.value)

const dialogWidth = computed(() => (windowWidth.value < 950 ? '93%' : DESKTOP_DIALOG_WIDTH))

const currentPageTitle = computed(() => {
  if (router.isAtMenu.value) return t('title')
  const item = MENU_ITEMS.find((i) => i.key === router.currentRoute.value)
  return item?.titleKey ? t(item.titleKey) : t('title')
})

const titleIsVisible = computed(() => detailViewRef.value?.titleIsVisible ?? false)

const slideTransitionName = computed(() =>
  isMobile.value ? (router.isForward.value ? 'settings-slide-left' : 'settings-slide-right') : ''
)

const resetRouter = () => router.reset(isMobile.value ? SettingsRoute.MENU : SettingsRoute.THEME)

function customShow() {
  // 预加载主题设置视图
  prefetchSettingsView(SettingsRoute.THEME)
  resetRouter()
  show()
}

function customToggle() {
  if (!opened.value) {
    // 预加载主题设置视图
    prefetchSettingsView(SettingsRoute.THEME)
    resetRouter()
  }
  toggle()
}

const handleMenuSelect = (key: string) => router.push(key as SettingsRoute)

const handleMobileBack = () => {
  // 使用 back() 来触发正确的后退动画（isForward = false）
  if (router.canGoBack.value) {
    router.back()
  } else {
    // 边缘情况：如果没有历史记录（如从桌面端切换到移动端），直接重置到 menu
    router.reset(SettingsRoute.MENU)
  }
}

const handleTransitionStart = () => (isTransitioning.value = true)
const handleTransitionEnd = () => (isTransitioning.value = false)

watch(windowWidth, (newWidth, oldWidth) => {
  if (oldWidth) {
    const wasMobile = oldWidth < MOBILE_BREAKPOINT
    const isNowMobile = newWidth < MOBILE_BREAKPOINT
    if (wasMobile !== isNowMobile) resetRouter()
  }
})

onMounted(() => {
  // 预加载主题设置视图
  prefetchSettingsView(SettingsRoute.THEME)
  resetRouter()
})

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
        :active-key="router.currentRoute.value"
        @select="handleMenuSelect"
      />
    </template>

    <Transition
      v-if="isMobile"
      :name="slideTransitionName"
      @before-leave="handleTransitionStart"
      @after-enter="handleTransitionEnd"
    >
      <settings-menu-view
        v-if="router.isAtMenu.value"
        key="menu"
        is-mobile
        :active-key="router.currentRoute.value"
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
        :dialog-opened="opened"
      />
    </Transition>

    <settings-detail-view
      v-else
      ref="detailViewRef"
      :current-route="router.currentRoute.value"
      :title="currentPageTitle"
      :dialog-opened="opened"
    />
  </SettingsDialog>
</template>
