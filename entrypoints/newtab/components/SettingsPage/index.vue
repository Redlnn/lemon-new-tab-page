<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { useDialog } from '@/entrypoints/newtab/composables/useDialog'

import BaseDialog from '@newtab/components/BaseDialog.vue'

import BackgroundSettings from './Settings/BackgroundSettings.vue'
import ClockSettings from './Settings/ClockSettings.vue'
import OtherSettings from './Settings/OtherSettings.vue'
import PerformanceSettings from './Settings/PerformanceSettings.vue'
import SearchSettings from './Settings/SearchSettings.vue'
import ShortcutSettings from './Settings/ShortcutSettings.vue'
import ThemeSettings from './Settings/ThemeSettings.vue'
import YiyanSettings from './Settings/YiyanSettings.vue'

const { t } = useTranslation()

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })
</script>

<template>
  <base-dialog
    v-model="opened"
    :title="t('newtab:settings.title')"
    container-class="settings__dialog"
    acrylic
    opacity
  >
    <theme-settings />
    <clock-settings />
    <search-settings />
    <background-settings />
    <shortcut-settings />
    <yiyan-settings />
    <performance-settings />
    <other-settings />
  </base-dialog>
</template>
