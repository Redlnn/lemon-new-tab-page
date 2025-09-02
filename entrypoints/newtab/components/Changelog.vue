<script setup lang="ts">
import { version } from '@/package.json'

import { ref } from 'vue'

import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/shared/settings'
import Changelog from '@newtab/Changelog'

import BaseDialog from './BaseDialog.vue'

const settingsStore = useSettingsStore()
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
    :title="i18n.t('newtab.changelog')"
    container-class="changelog__dialog"
    @closed="() => (settingsStore.pluginVersion = version)"
    acrylic
  >
    <component :is="Changelog"></component>
  </base-dialog>
</template>

<style lang="scss">
.changelog__dialog {
  h2 {
    font-weight: 500;
  }

  li {
    margin: 0.25em 0;
    line-height: 1.6;
  }

  a {
    color: #1677ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  p,
  strong,
  b {
    line-height: 1.6;
  }

  blockquote {
    padding: 0.2em 1em;
    margin: 0.3em 0 0.5em;
    color: var(--el-text-color-regular);
    border-left: 0.25em solid var(--el-text-color-secondary);
  }

  details {
    margin-top: 20px;

    summary {
      font-size: medium;
      font-weight: 500;
      cursor: pointer;
    }
  }
}
</style>
