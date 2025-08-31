<script setup lang="ts">
import { ref } from 'vue'
import { i18n } from '@/.wxt/i18n'
import BaseDialog from '../BaseDialog.vue'

import BackgroundSettings from './Settings/BackgroundSettings.vue'
import ClockSettings from './Settings/ClockSettings.vue'
import OtherSettings from './Settings/OtherSettings.vue'
import SearchSettings from './Settings/SearchSettings.vue'
import ThemeSettings from './Settings/ThemeSettings.vue'
import ShortcutSettings from './Settings/ShortcutSettings.vue'
import YiyanSettings from './Settings/YiyanSettings.vue'

const opened = ref(false)

function show() {
  opened.value = true
}
function hide() {
  opened.value = false
}
function toggleShow() {
  opened.value = !opened.value
}

defineExpose({ show, hide, toggleShow })
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
