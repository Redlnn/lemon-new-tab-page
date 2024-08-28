<script setup lang="ts">
import 'element-plus/theme-chalk/el-message-box.css'
import { ControlOutlined } from '@vicons/antd'
import { DeleteForeverOutlined } from '@vicons/material'
import { ElMessageBox } from 'element-plus'

import { LocalExtensionStorage, SyncExtensionStorage } from '@/entrypoints/newtab/js/storage'
import { useSettingsStore, useWallpaperStore } from '@/entrypoints/newtab/js/store'

const settingsStore = useSettingsStore()
async function confirmClearExtensionData() {
  try {
    await ElMessageBox.confirm(
      '将会重置扩展设置、已忽略的最常访问站点、已选择的背景图片。',
      '确定要清除所有数据吗?',
      {
        confirmButtonText: '好',
        cancelButtonText: '算了',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  await clearExtensionData()
}

async function clearExtensionData() {
  console.warn('正在清除扩展数据')
  localStorage.clear()
  sessionStorage.clear()
  await SyncExtensionStorage.clear()
  await LocalExtensionStorage.clear()
  await useWallpaperStore.clear()
  location.reload()
}
</script>

<template>
  <h3 class="settings-title">
    <el-icon><control-outlined /></el-icon>
    <span>其他设置</span>
  </h3>
  <div class="settings-item horizontal">
    <div class="settings-label">一言</div>
    <el-switch v-model="settingsStore.enableYiyan" size="large" />
  </div>
  <div class="settings-item horizontal">
    <div class="settings-label">清除本扩展数据</div>
    <el-button
      type="danger"
      :icon="DeleteForeverOutlined"
      circle
      @click="confirmClearExtensionData"
    />
  </div>
  <div class="settings-item">
    <div class="settings-label">要自定义Chrome？</div>
    <p style="color: var(--el-text-color-regular); line-height: 1.5em; font-size: 12px">
      假如你要自定义 Chrome（例如更改颜色主题）的话，你只能打开Chrome 的原生新标签页
      (chrome://new-tab-page) 并点击右下角的图标来打开“自定义 Chrome”侧边栏。
    </p>
  </div>
</template>
