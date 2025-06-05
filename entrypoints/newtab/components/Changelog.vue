<script setup lang="ts">
import { ref } from 'vue'
import { useElementVisibility, useWindowSize } from '@vueuse/core'

import { CloseRound } from '@vicons/material'
import type { ScrollbarInstance } from 'element-plus'

import { i18n } from '@/.wxt/i18n'
import { version } from '@/package.json'

import Changelog from '@/newtab/Changelog'
import { useSettingsStore } from '@/newtab/scripts/store'

const settingsStore = useSettingsStore()
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
    class="changelog__dialog"
    :show-close="false"
    align-center
    lock-scroll
    draggable
    @open="() => scrollbar?.setScrollTop(0)"
    @closed="() => (settingsStore.pluginVersion = version)"
  >
    <template #header="{ close, titleId }">
      <div :id="titleId" class="changelog__title" :style="{ opacity: !headerIsVisible ? 1 : 0 }">
        {{ i18n.t('newtab.changelog') }}
      </div>
      <span class="changelog__close-btn" @click="close">
        <component :is="CloseRound" />
      </span>
    </template>
    <div
      style="
        width: 100%;
        height: 1px;
        border-top: 1px color-mix(in srgb, var(--el-border-color), transparent 30%)
          var(--el-border-style);
        transition: opacity 0.1s ease;
      "
      :style="{ opacity: !headerIsVisible ? 1 : 0 }"
    ></div>
    <div style="height: 100%; padding: 0 19px 0 35px">
      <el-scrollbar ref="scrollbar" style="padding-right: 15px">
        <div ref="header" class="changelog__list-title">
          {{ i18n.t('newtab.changelog') }}
        </div>
        <component :is="Changelog"></component>
        <div style="height: 35px"></div>
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<style lang="scss">
.changelog {
  &__dialog {
    height: 500px;
    max-height: 80%;
    padding: 0;
    overflow: hidden;
    background-color: color-mix(in srgb, var(--el-bg-color-page), transparent 20%);
    border-radius: 10px;
    box-shadow: 0 0 15px 0 color-mix(in srgb, var(--el-bg-color-page), transparent 60%);
    backdrop-filter: blur(10px) saturate(1.4);
    transition:
      background-color var(--el-transition-duration-fast) ease,
      box-shadow var(--el-transition-duration-fast) ease;

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
    }

    .changelog__blockquote {
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

  .el-dialog__header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 50px;
    padding: 0;
  }

  .el-dialog__body {
    height: calc(100% - 51px);
    color: var(--el-text-color-primary);
    transition: color var(--el-transition-duration-fast) ease;
  }

  &__title {
    font-size: 18px;
    transition: opacity 0.1s ease;
  }

  &__close-btn {
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

  &__list-title {
    margin-top: 30px;
    font-size: 28px;
  }
}
</style>
