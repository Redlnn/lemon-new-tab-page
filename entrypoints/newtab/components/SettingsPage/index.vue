<script setup lang="ts">
import { i18n } from '@/.wxt/i18n'

import BaseDialog from '@newtab/components/BaseDialog.vue'
import { useDialog } from '@newtab/composables/useDialog'

import BackgroundSettings from './Settings/BackgroundSettings.vue'
import ClockSettings from './Settings/ClockSettings.vue'
import OtherSettings from './Settings/OtherSettings.vue'
import SearchSettings from './Settings/SearchSettings.vue'
import ShortcutSettings from './Settings/ShortcutSettings.vue'
import ThemeSettings from './Settings/ThemeSettings.vue'
import YiyanSettings from './Settings/YiyanSettings.vue'

const { opened, show, hide, toggle } = useDialog()
defineExpose({ show, hide, toggle })
</script>

<template>
  <base-dialog
    v-model="opened"
    :title="i18n.t('newtab.settings.title')"
    container-class="settings__dialog"
    acrylic
  >
    <theme-settings />
    <clock-settings />
    <search-settings />
    <background-settings />
    <shortcut-settings />
    <yiyan-settings />
    <other-settings />
  </base-dialog>
</template>
