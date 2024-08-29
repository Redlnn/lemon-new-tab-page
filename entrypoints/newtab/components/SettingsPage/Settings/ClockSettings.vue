<script setup lang="ts">
import { ClockCircleOutlined } from '@vicons/antd'

import { useSettingsStore } from '@/entrypoints/newtab/js/store/settingsStore'

const settingsStore = useSettingsStore()
</script>

<template>
  <h3 class="settings-title">
    <el-icon><clock-circle-outlined /></el-icon>
    <span>时钟设置</span>
  </h3>
  <div class="settings-item horizontal">
    <div class="settings-label">12小时制</div>
    <el-switch v-model="settingsStore.time.isMeridiem" size="large" />
  </div>
  <div class="settings-item horizontal">
    <div class="settings-label">展示“上午/下午”</div>
    <el-switch v-model="settingsStore.time.showMeridiem" size="large" />
  </div>
</template>
