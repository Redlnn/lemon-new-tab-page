<script setup lang="ts">
import { MoreVertRound } from '@vicons/material'
import { Pin16Regular } from '@vicons/fluent'

import { useSettingsStore } from '@/newtab/scripts/store'
import { convertBase64Svg } from '@/newtab/scripts/img'
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
        <div v-if="pined && settingsStore.shortcut.showPinnedIcon" class="shortcut__pin-icon">
          <el-icon size="15">
            <pin16-regular />
          </el-icon>
        </div>
        <!-- eslint-disable vue/no-v-html -->
        <div class="shortcut__icon">
          <span
            v-if="!!favicon && favicon.startsWith('data:image/svg+xml')"
            v-html="convertBase64Svg(favicon as string)"
          ></span>
          <span
            v-else
            :style="{
              backgroundImage: favicon ? `url(${favicon})` : `url(${getFaviconURLChrome(url)})`
            }"
          ></span>
        </div>
      </div>
      <div v-if="settingsStore.shortcut.showShortcutTitle" class="shortcut__title">
        {{ title }}
      </div>
    </a>
    <el-dropdown class="shortcut__menu" trigger="click" placement="bottom-end" size="small">
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
