<script setup lang="ts">
import { AppstoreOutlined } from '@vicons/antd'
import { RestoreRound } from '@vicons/material'

import { useSettingsStore } from '@/newtab/js/store'
import { LocalExtensionStorage } from '@/newtab/js/storage'

const settingsStore = useSettingsStore()

async function restoreDefaultTopSites() {
  await LocalExtensionStorage.setItem('blockedTopStites', [])
  location.reload()
}
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
    <div class="settings-label">最大行数</div>
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
    <div class="settings-label">最大列数</div>
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
  <div class="settings-item top-sites-item-width">
    <div class="settings-label">链接宽度</div>
    <el-slider
      v-model="settingsStore.topSitesItemWidth"
      :min="100"
      :max="200"
      show-input
      :show-input-controls="false"
      :show-tooltip="false"
    />
  </div>
  <div class="settings-item horizontal">
    <div class="settings-label">恢复默认快捷方式</div>
    <el-popconfirm
      width="220"
      confirm-button-text="好"
      cancel-button-text="算了"
      :icon="RestoreRound"
      icon-color="#626AEF"
      title="你确定要恢复默认快捷方式吗？"
      @confirm="restoreDefaultTopSites()"
    >
      <template #reference>
        <el-button :icon="RestoreRound" circle />
      </template>
    </el-popconfirm>
  </div>
</template>

<style scoped lang="scss">
.top-sites-item-width:deep() .el-input-number,
.top-sites-item-width:deep() .el-input {
  width: 60px;
}
</style>
