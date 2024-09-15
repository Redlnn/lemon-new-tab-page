<script setup lang="ts">
import { ClockCircleOutlined } from '@vicons/antd'

import { i18n } from '@/.wxt/i18n'
import { useSettingsStore } from '@/entrypoints/newtab/js/store/settingsStore'

const settingsStore = useSettingsStore()
</script>

<template>
  <div class="settings-title">
    <el-icon><clock-circle-outlined /></el-icon>
    <span>{{ i18n.t('newtab.settings.clock.title') }}</span>
  </div>
  <div class="setting-items-container">
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.clock.use_12h_clock') }}</div>
      <el-switch v-model="settingsStore.time.isMeridiem" />
    </div>
    <div class="settings-item horizontal">
      <div class="settings-label">{{ i18n.t('newtab.settings.clock.show_ampm') }}</div>
      <el-switch v-model="settingsStore.time.showMeridiem" />
    </div>
  </div>
</template>
