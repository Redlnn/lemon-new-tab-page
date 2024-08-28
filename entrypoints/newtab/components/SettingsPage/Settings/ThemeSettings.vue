<script setup lang="ts">
import { ColorLensOutlined } from '@vicons/material'
import { ref } from 'vue'
import { useColorMode } from '@vueuse/core'

import changeTheme from '@/entrypoints/newtab/js/use-element-plus-theme'
import { useSettingsStore } from '@/entrypoints/newtab/js/store'

import autoMode from '@/entrypoints/newtab/assets/color/auto-mode.svg?url'
import darkMode from '@/entrypoints/newtab/assets/color/dark-mode.svg?url'
import lightMode from '@/entrypoints/newtab/assets/color/light-mode.svg?url'
import selected from '@/entrypoints/newtab/assets/color/selected.svg?component'
// import selected from '@/entrypoints/newtab/components/icon/selected'

const settingsStore = useSettingsStore()
const colorMode = useColorMode()

const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585'
])
</script>

<template>
  <h3 class="settings-title">
    <el-icon><color-lens-outlined /></el-icon>
    <span>主题设置</span>
  </h3>
  <div class="settings-item">
    <div class="settings-label">深色模式</div>
    <div class="theme-mode">
      <el-tooltip content="跟随系统" placement="top">
        <span class="theme-item" @click="colorMode = 'auto'">
          <img :src="autoMode" />
          <span class="selected"><selected /></span>
        </span>
      </el-tooltip>
      <el-tooltip content="浅色模式" placement="top">
        <span
          class="theme-item"
          :class="{ active: colorMode === 'light' }"
          @click="colorMode = 'light'"
        >
          <img :src="lightMode" />
          <span class="selected"><selected /></span>
        </span>
      </el-tooltip>
      <el-tooltip content="深色模式" placement="top">
        <span
          class="theme-item"
          :class="{ active: colorMode === 'dark' }"
          @click="colorMode = 'dark'"
        >
          <img :src="darkMode" />
          <span class="selected"><selected /></span>
        </span>
      </el-tooltip>
    </div>
  </div>
  <div class="settings-item horizontal">
    <div class="settings-label">主题颜色</div>
    <div class="color-mode">
      <el-color-picker
        v-model="settingsStore.primaryColor"
        :predefine="predefineColors"
        @change="
          () => {
            if (settingsStore.primaryColor === null) {
              settingsStore.primaryColor = '#409eff'
            }
            changeTheme(settingsStore.primaryColor)
          }
        "
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.theme-mode {
  display: flex;
  column-gap: 8px;

  .theme-item {
    position: relative;
    cursor: pointer;

    & .selected {
      display: none;
    }
    &.active .selected {
      display: block;
      position: absolute;
      right: 8px;
      bottom: 8px;
      color: var(--el-color-primary);
    }
  }
}

:deep().el-color-picker__trigger {
  padding: 0;
  border: none;
  overflow: hidden;
  border-radius: 8px;

  .el-color-picker__color {
    border: none;
    border-radius: none;
  }
}
</style>
