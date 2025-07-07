<script setup lang="ts">
import { ref } from 'vue'
import { i18n } from '@/.wxt/i18n'
import BaseDialog from '../BaseDialog.vue'

import BackgroundSettings from './Settings/BackgroundSettings.vue'
import ClockSettings from './Settings/ClockSettings.vue'
import MoreAbout from './Settings/MoreAbout.vue'
import OtherSettings from './Settings/OtherSettings.vue'
import SearchSettings from './Settings/SearchSettings.vue'
import ThemeSettings from './Settings/ThemeSettings.vue'
import ShortcutSettings from './Settings/ShortcutSettings.vue'

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
  >
    <theme-settings />
    <clock-settings />
    <search-settings />
    <background-settings />
    <shortcut-settings />
    <other-settings />
    <more-about />
  </base-dialog>
</template>

<style lang="scss">
.settings__title {
  display: flex;
  align-items: center;
  margin: 30px 0 6px 10px;
  font-size: 1.1em;
  font-weight: 900;

  span {
    margin-left: 5px;
  }
}

.settings__items-container {
  padding: 10px 25px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  transition: background-color var(--el-transition-duration-fast) ease;
}

.settings__item {
  width: 100%;
  min-height: 40px;
  overflow: hidden;

  &--horizontal {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .el-slider {
    height: 35px;
    padding: 0 10px;
  }
}

.settings__label {
  display: flex;
  align-items: center;
  margin: 10px 0 6px;

  svg {
    width: 1em;
    height: 1em;
    margin-left: 0.5em;
    opacity: 0.4;
  }
}

.settings__item--note {
  margin-top: 0;
  font-size: 12px;
  line-height: 1.5em;
  color: var(--el-text-color-regular);

  svg {
    width: 1.2em;
    height: 1.2em;
    vertical-align: middle;
    opacity: 0.4;
  }
}
</style>
