<script setup lang="ts">
import { Pin16Regular } from '@vicons/fluent'
import { MoreVertRound } from '@vicons/material'

import { convertBase64Svg } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import { getFaviconURLChrome } from '../utils/topSites'

const settingsStore = useSettingsStore()

defineProps<{
  url: string
  title: string
  pined?: boolean
  favicon?: string
}>()
</script>

<template>
  <div class="shortcut__item">
    <a class="shortcut__item-link" :href="url">
      <div class="shortcut__icon-container">
        <div
          v-if="
            pined && settingsStore.shortcut.showPinnedIcon && settingsStore.shortcut.enableTopSites
          "
          :class="[
            'shortcut__pin-icon',
            !settingsStore.perf.disableShortcutTransparent && 'shortcut__pin-icon--opacity',
            !(
              settingsStore.perf.disableShortcutBlur ||
              settingsStore.perf.disableShortcutTransparent
            ) && 'shortcut__pin-icon--blur'
          ]"
        >
          <el-icon size="15">
            <pin16-regular />
          </el-icon>
        </div>
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="shortcut__icon"
          :class="{
            'shortcut__icon--opacity': !settingsStore.perf.disableShortcutTransparent,
            'shortcut__icon--blur': !(
              settingsStore.perf.disableShortcutBlur ||
              settingsStore.perf.disableShortcutTransparent
            )
          }"
        >
          <span
            v-if="!!favicon && favicon.startsWith('data:image/svg+xml')"
            v-html="convertBase64Svg(favicon as string)"
            class="span"
          ></span>
          <span
            v-else
            class="span"
            :style="{
              backgroundImage: favicon ? `url(${favicon})` : `url(${getFaviconURLChrome(url)})`
            }"
          ></span>
        </div>
      </div>
      <el-text
        :data-content="title"
        v-if="settingsStore.shortcut.showShortcutTitle"
        class="shortcut__title"
        truncated
      >
        {{ title }}
      </el-text>
    </a>
    <el-dropdown
      class="shortcut__menu"
      trigger="click"
      placement="bottom-end"
      size="small"
      :popper-class="`shortcut__menu-popper ${
        !settingsStore.perf.disableShortcutTransparent ? 'shortcut__menu-popper--opacity' : ''
      } ${
        !(settingsStore.perf.disableShortcutBlur || settingsStore.perf.disableShortcutTransparent)
          ? 'shortcut__menu-popper--blur'
          : ''
      }`"
    >
      <span class="shortcut__menu-icon">
        <el-icon>
          <more-vert-round />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <slot name="submenu"></slot>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
