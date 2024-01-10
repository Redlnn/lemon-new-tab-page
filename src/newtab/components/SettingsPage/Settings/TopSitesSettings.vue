<script setup lang="ts">
import { AppstoreOutlined } from '@vicons/antd'

import { useSettingsStore } from '@/newtab/js/store'

const settingsStore = useSettingsStore()
</script>

<template>
  <h3 class="settings-title">
    <el-icon><appstore-outlined /></el-icon>
    <span>最常访问</span>
  </h3>
  <div class="settings-item horizontal">
    <div class="settings-label">启用</div>
    <el-switch v-model="settingsStore.enableTopSites" size="large" />
  </div>
  <div class="settings-item">
    <div class="settings-label">行数</div>
    <el-slider
      v-model="settingsStore.topSitesRows"
      :step="1"
      :min="1"
      :max="5"
      show-stops
      :show-tooltip="false"
      style="margin-bottom: 20px"
      :marks="{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }"
    />
  </div>
  <div class="settings-item">
    <div class="settings-label">列数</div>
    <el-slider
      v-model="settingsStore.topSitesColumns"
      :step="1"
      :min="1"
      :max="10"
      show-stops
      :show-tooltip="false"
      style="margin-bottom: 20px"
      :marks="{ 1: '1', 10: '10' }"
    />
  </div>
  <p style="color: var(--el-text-color-regular); line-height: 1.5em; font-size: 12px">
    最常访问的上限只有10个噢~
  </p>
</template>
