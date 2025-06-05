<script setup lang="ts">
import { ref } from 'vue'
import { useElementVisibility, useWindowSize } from '@vueuse/core'

import { CloseRound } from '@vicons/material'
import type { ScrollbarInstance } from 'element-plus'

import BackgroundSettings from './Settings/BackgroundSettings.vue'
import ClockSettings from './Settings/ClockSettings.vue'
import MoreAbout from './Settings/MoreAbout.vue'
import OtherSettings from './Settings/OtherSettings.vue'
import SearchSettings from './Settings/SearchSettings.vue'
import ThemeSettings from './Settings/ThemeSettings.vue'
import ShortcutSettings from './Settings/ShortcutSettings.vue'
import { i18n } from '@/.wxt/i18n'

const opened = ref(false)
const header = ref<HTMLDivElement>()
const scrollbar = ref<ScrollbarInstance>()
const headerIsVisible = useElementVisibility(header)

const { width: windowWidth } = useWindowSize()

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
  <el-dialog
    v-model="opened"
    :width="windowWidth < 650 ? '90%' : 600"
    class="settings__dialog"
    :show-close="false"
    align-center
    lock-scroll
    draggable
    overflow
  >
    <template #header="{ close, titleId }">
      <div
        :id="titleId"
        class="settings__dialog-title"
        :style="{ opacity: !headerIsVisible ? 1 : 0 }"
      >
        {{ i18n.t('newtab.settings.title') }}
      </div>
      <span class="settings__dialog-close-btn" @click="close">
        <component :is="CloseRound" />
      </span>
    </template>
    <div
      style="
        height: 1px;
        width: 100%;
        border-top: 1px color-mix(in srgb, var(--el-border-color), transparent 30%)
          var(--el-border-style);
        transition: opacity 0.1s;
      "
      :style="{ opacity: !headerIsVisible ? 1 : 0 }"
    ></div>
    <div class="settings__container" style="height: 100%">
      <el-scrollbar ref="scrollbar" style="padding-right: 15px">
        <div ref="header" class="settings__dialog-list-title">
          {{ i18n.t('newtab.settings.title') }}
        </div>
        <theme-settings />
        <clock-settings />
        <search-settings />
        <background-settings />
        <shortcut-settings />
        <other-settings />
        <more-about />
        <div style="height: 35px"></div>
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<style lang="scss">
.settings__dialog {
  padding: 0;
  max-height: 80%;
  height: 500px;
  background-color: color-mix(in srgb, var(--el-bg-color-page), transparent 20%);
  backdrop-filter: blur(10px) saturate(1.4);
  border-radius: 10px;
  box-shadow: 0 0 15px 0 color-mix(in srgb, var(--el-bg-color-page), transparent 60%);
  overflow: hidden;
  transition:
    background-color var(--el-transition-duration-fast) ease,
    box-shadow var(--el-transition-duration-fast) ease;

  .settings__container {
    height: 100%;
    padding: 0 19px 0 35px;
  }

  @media screen and (max-width: 650px) {
    .settings__container {
      padding: 0 4px 0 20px;
    }
  }

  .el-dialog__header {
    padding: 0;
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .el-dialog__body {
    height: calc(100% - 51px);
    color: var(--el-text-color-primary);
    transition: color var(--el-transition-duration-fast) ease;
  }

  .settings__dialog-title {
    font-size: 18px;
    transition: opacity 0.1s;
  }

  .settings__dialog-close-btn {
    position: fixed;
    right: 20px;
    height: 20px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition:
      transform 0.1s ease-in-out,
      color var(--el-transition-duration-fast) ease;

    &:hover {
      color: var(--el-text-color-primary);
      transform: rotate(90deg);
    }

    svg {
      height: 100%;
    }
  }

  .settings__dialog-list-title {
    font-size: 28px;
    margin-top: 30px;
  }
}

.settings__title {
  display: flex;
  align-items: center;
  margin: 30px 0 6px 10px;
  font-weight: 900;
  font-size: 1.1em;

  span {
    margin-left: 5px;
  }
}

.settings__items-container {
  background-color: var(--el-bg-color);
  padding: 10px 25px;
  border-radius: 8px;
  transition: background-color var(--el-transition-duration-fast) ease;
}

.settings__item {
  min-height: 40px;
  width: 100%;
  overflow: hidden;

  &--horizontal {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .el-slider {
    padding: 0 10px;
    height: 35px;
  }
}

.settings__label {
  margin: 10px 0 6px;
}
</style>
