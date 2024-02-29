<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'
import { SettingsOutlined } from '@vicons/material'
import { useColorMode } from '@vueuse/core'
import zhCn from 'element-plus/es/locale/lang/zh-cn.mjs'
import { onBeforeMount, ref, watch } from 'vue'

import Background from './components/Background.vue'
import QuickStart from './components/QuickStart/index.vue'
import SearchBox from './components/SearchBox/index.vue'
import SettingsPage from './components/SettingsPage/index.vue'
import TimeNow from './components/TimeNow.vue'
import YiYan from './components/YiYan.vue'

import changeTheme from './js/use-element-plus-theme'
import { getBingWallpaperURL } from './js/api/bingWallpaper'
import { verifyImageUrl } from './js/utils/img'
import { BgType, readSettings, useSettingsStore } from './js/store'

useColorMode()
const settingsStore = useSettingsStore()
const SettingsPageRef = ref<InstanceType<typeof SettingsPage>>()

const bgURL = ref('')

onBeforeMount(async () => {
  const settings = await readSettings()

  for (const key in settings) {
    settingsStore[key] = settings[key]
  }
  changeTheme(settingsStore.primaryColor)

  switch (settingsStore.bgType) {
    case BgType.Bing:
      bgURL.value = `url(${await getBingWallpaperURL()})`
      break
    case BgType.Local:
      if (settingsStore.bgUrl) {
        const verifyBackground = await verifyImageUrl(settingsStore.bgUrl)
        if (!verifyBackground) {
          await settingsStore.reloadBackgroundImage()
        }
      } else {
        await settingsStore.reloadBackgroundImage()
      }

      bgURL.value = settingsStore.bgUrl ? `url(${settingsStore.bgUrl})` : ''
      break
  }
})

watch(
  () => settingsStore.bgType,
  async () => {
    switch (settingsStore.bgType) {
      case BgType.Bing:
        bgURL.value = `url(${await getBingWallpaperURL()})`
        break
      case BgType.Local:
        bgURL.value = `url(${settingsStore.bgUrl})`
        break
      case BgType.None:
        bgURL.value = ''
        break
    }
  }
)
watch(
  () => settingsStore.bgUrl,
  () => (bgURL.value = `url(${settingsStore.bgUrl})`)
)
</script>

<template>
  <el-config-provider :locale="zhCn">
    <main>
      <time-now />
      <search-box style="margin-top: 10px" />
      <quick-start v-if="settingsStore.enableQuickStart" />
      <yi-yan />
    </main>
    <background :bgurl="bgURL" />
    <div class="settings-icon" @click="SettingsPageRef?.toggleShow">
      <el-icon><settings-outlined /></el-icon>
    </div>
    <settings-page ref="SettingsPageRef" />
  </el-config-provider>
</template>

<style scoped lang="scss">
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.settings-icon {
  position: fixed;
  bottom: 20px;
  right: 30px;
  height: calc(1em + 12px);
  color: color-mix(in oklab, var(--el-text-color-primary), transparent 20%);
  font-size: 25px;
  line-height: 1em;
  cursor: pointer;
  background-color: color-mix(in oklab, var(--el-bg-color), transparent 80%);
  padding: 6px;
  border-radius: 50%;
  overflow: hidden;
  transition: 0.1s;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-bg-color);
    box-shadow: var(--el-box-shadow-lighter);
  }
}
</style>
