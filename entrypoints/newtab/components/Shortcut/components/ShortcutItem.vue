<script setup lang="ts">
import { Pin16Regular } from '@vicons/fluent'
import { MoreVertRound } from '@vicons/material'

import { getPerfClasses } from '@/shared/composables/perfClasses'
import { convertBase64Svg } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import { getFaviconURLChrome } from '../utils/topSites'

const settings = useSettingsStore()

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
          v-if="pined && settings.shortcut.showPinnedIcon && settings.shortcut.enableTopSites"
          :class="[
            'shortcut__pin-icon',
            getPerfClasses(
              {
                transparentOff: settings.perf.disableShortcutTransparent,
                blurOff: settings.perf.disableShortcutBlur
              },
              'shortcut__pin-icon'
            )
          ]"
        >
          <el-icon size="15">
            <pin16-regular />
          </el-icon>
        </div>
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="shortcut__icon"
          :class="
            getPerfClasses(
              {
                transparentOff: settings.perf.disableShortcutTransparent,
                blurOff: settings.perf.disableShortcutBlur
              },
              'shortcut__icon'
            )
          "
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
        v-if="settings.shortcut.showShortcutTitle"
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
      :popper-class="
        getPerfClasses(
          {
            transparentOff: settings.perf.disableShortcutTransparent,
            blurOff: settings.perf.disableShortcutBlur
          },
          'shortcut__menu-popper'
        )
      "
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
