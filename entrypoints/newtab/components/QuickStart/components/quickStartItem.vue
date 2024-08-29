<script setup lang="ts">
import { MoreVertRound } from '@vicons/material'
import { Pin16Regular } from '@vicons/fluent'

import { useSettingsStore } from '@/entrypoints/newtab/js/store/settingsStore'

import { getFaviconURL } from '../utils/topSites'
import { getQuickStartItemWidth } from '../utils/index'

const settingsStore = useSettingsStore()

defineProps<{
  url: string
  title: string
  qsSitesSize: number
  pined?: boolean
}>()
</script>

<template>
  <div
    class="quickstart-item"
    :style="{
      flexBasis: getQuickStartItemWidth(qsSitesSize, settingsStore.quickStart.quickStartColumns),
      width: `${settingsStore.quickStart.quickStartItemWidth}px`
    }"
  >
    <a class="quickstart-item-link" :href="url">
      <div class="quickstart-icon">
        <div class="pin-icon" v-if="pined && settingsStore.quickStart.showPinnedIcon">
          <el-icon size="15">
            <pin16-regular />
          </el-icon>
        </div>
        <span :style="{ backgroundImage: `url(${getFaviconURL(url)})` }"></span>
      </div>
      <div class="quickstart-title" v-if="settingsStore.quickStart.showQuickStartTitle">
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
