<script setup lang="ts">
import { MoreVertRound } from '@vicons/material'

import { useSettingsStore } from '@/newtab/js/store'

import { getFaviconURL } from '../utils/topSites'
import { getQuickStartItemWidth } from '../utils/index'

const settingsStore = useSettingsStore()

defineProps<{
  url: string
  title: string
  qsSitesSize: number
}>()
</script>

<template>
  <div
    class="quickstart-item"
    :style="{
      flexBasis: getQuickStartItemWidth(qsSitesSize, settingsStore.QuickStartColumns),
      width: `${settingsStore.QuickStartItemWidth}px`
    }"
  >
    <a class="quickstart-item-link" :href="url">
      <div class="quickstart-icon">
        <span :style="{ backgroundImage: `url(${getFaviconURL(url)})` }"></span>
      </div>
      <div class="quickstart-title">{{ title }}</div>
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
