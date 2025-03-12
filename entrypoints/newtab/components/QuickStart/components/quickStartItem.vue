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
  <div class="quickstart-item">
    <a class="quickstart-item-link" :href="url">
      <div class="quickstart-icon">
        <div v-if="pined && settingsStore.quickStart.showPinnedIcon" class="pin-icon">
          <el-icon size="15">
            <pin16-regular />
          </el-icon>
        </div>
        <!-- eslint-disable vue/no-v-html -->
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
      <div v-if="settingsStore.quickStart.showQuickStartTitle" class="quickstart-title">
        {{ title }}
      </div>
    </a>
    <el-dropdown class="quickstart-menu" trigger="click" placement="bottom-end" size="small">
      <span class="quickstart-menu-icon">
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
