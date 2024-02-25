<script setup lang="ts">
import { ref } from 'vue'

import { saveSettings, useSettingsStore } from '@/newtab/js/store'

import BackgroundSettings from './Settings/BackgroundSettings.vue'
import ClockSettings from './Settings/ClockSettings.vue'
import MoreAbout from './Settings/MoreAbout.vue'
import OtherSettings from './Settings/OtherSettings.vue'
import SearchSettings from './Settings/SearchSettings.vue'
import ThemeSettings from './Settings/ThemeSettings.vue'
import TopSitesSettings from './Settings/TopSitesSettings.vue'

const opened = ref(false)

function show() {
  opened.value = true
}
function hide() {
  opened.value = false
}
function toggleShow() {
  opened.value = !opened.value
}

defineExpose({ show, hide, toggleShow })

const settingsStore = useSettingsStore()
settingsStore.$subscribe(
  async (mutation, state) => {
    await saveSettings(state)
  },
  { detached: true }
)
</script>

<template>
  <el-drawer
    v-model="opened"
    lock-scroll
    :with-header="false"
    :size="400"
    style="--el-drawer-padding-primary: 0px"
  >
    <el-scrollbar style="padding: 24px">
      <theme-settings />
      <el-divider />
      <clock-settings />
      <el-divider />
      <search-settings />
      <el-divider />
      <background-settings />
      <el-divider />
      <top-sites-settings />
      <el-divider />
      <other-settings />
      <el-divider />
      <more-about />
    </el-scrollbar>
  </el-drawer>
</template>

<style lang="scss">
.settings-title {
  display: flex;
  align-items: center;

  span {
    margin-left: 5px;
  }
}

.settings-item {
  min-height: 40px;
  margin: 8px 0;
  width: 100%;
  overflow: hidden;

  &.horizontal {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .el-slider {
    padding: 0 10px;
  }
}

.settings-label {
  margin: 10px 0 6px;
}
</style>
