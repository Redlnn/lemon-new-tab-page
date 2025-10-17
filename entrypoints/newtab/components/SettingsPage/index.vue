<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { useDialog } from '@/entrypoints/newtab/composables/useDialog'

import BaseDialog from '@newtab/components/BaseDialog.vue'
import { useSettingsRouter } from '@newtab/composables/useSettingsRouter'

import BackgroundSettings from './Settings/BackgroundSettings.vue'
import ClockSettings from './Settings/ClockSettings.vue'
import OtherSettings from './Settings/OtherSettings.vue'
import PerformanceSettings from './Settings/PerformanceSettings.vue'
import SearchSettings from './Settings/SearchSettings.vue'
import SettingsDetailPage from './SettingsDetailPage.vue'
import SettingsMenu from './SettingsMenu.vue'
import ShortcutSettings from './Settings/ShortcutSettings.vue'
import ThemeSettings from './Settings/ThemeSettings.vue'
import YiyanSettings from './Settings/YiyanSettings.vue'

const { t } = useTranslation()
const router = useSettingsRouter()

const { opened, show, hide, toggle } = useDialog()

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

// Get dialog title based on current route
const dialogTitle = computed(() => {
  if (router.currentRoute.value === 'menu') {
    return t('newtab:settings.title')
  }
  // For detail pages, don't show title in dialog header since it's in the page itself
  return ''
})
</script>

<template>
  <base-dialog
    v-model="opened"
    :title="dialogTitle"
    container-class="settings__dialog"
    acrylic
    opacity
    @closed="handleClose"
  >
    <Transition name="settings-page" mode="out-in">
      <SettingsMenu v-if="router.currentRoute.value === 'menu'" key="menu" />
      
      <SettingsDetailPage
        v-else-if="router.currentRoute.value === 'theme'"
        key="theme"
        :title="t('newtab:settings.theme.title')"
      >
        <theme-settings />
      </SettingsDetailPage>

      <SettingsDetailPage
        v-else-if="router.currentRoute.value === 'clock'"
        key="clock"
        :title="t('newtab:settings.clock.title')"
      >
        <clock-settings />
      </SettingsDetailPage>

      <SettingsDetailPage
        v-else-if="router.currentRoute.value === 'search'"
        key="search"
        :title="t('newtab:settings.search.title')"
      >
        <search-settings />
      </SettingsDetailPage>

      <SettingsDetailPage
        v-else-if="router.currentRoute.value === 'background'"
        key="background"
        :title="t('newtab:settings.background.title')"
      >
        <background-settings />
      </SettingsDetailPage>

      <SettingsDetailPage
        v-else-if="router.currentRoute.value === 'shortcut'"
        key="shortcut"
        :title="t('newtab:settings.shortcut.title')"
      >
        <shortcut-settings />
      </SettingsDetailPage>

      <SettingsDetailPage
        v-else-if="router.currentRoute.value === 'yiyan'"
        key="yiyan"
        :title="t('newtab:settings.yiyan.title')"
      >
        <yiyan-settings />
      </SettingsDetailPage>

      <SettingsDetailPage
        v-else-if="router.currentRoute.value === 'performance'"
        key="performance"
        :title="t('newtab:settings.perf.title')"
      >
        <performance-settings />
      </SettingsDetailPage>

      <SettingsDetailPage
        v-else-if="router.currentRoute.value === 'other'"
        key="other"
        :title="t('newtab:settings.other.title')"
      >
        <other-settings />
      </SettingsDetailPage>
    </Transition>
  </base-dialog>
</template>

<style lang="scss">
.settings-page-enter-active,
.settings-page-leave-active {
  transition: all 0.3s ease;
}

.settings-page-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.settings-page-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
