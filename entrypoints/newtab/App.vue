<script lang="ts" setup>
import { version } from '@/package.json'

import { ElConfigProvider } from 'element-plus'
import { SettingsOutlined } from '@vicons/material'
import { useColorMode, promiseTimeout } from '@vueuse/core'
import zhCn from 'element-plus/es/locale/lang/zh-cn.mjs'
import { onMounted, ref, watch } from 'vue'

import Background from './components/Background.vue'
import Changelog from './components/Changelog.vue'
import QuickStart from './components/QuickStart/index.vue'
import SearchBox from './components/SearchBox/index.vue'
import SettingsPage from './components/SettingsPage/index.vue'
import TimeNow from './components/TimeNow.vue'
import YiYan from './components/YiYan.vue'

import { getBingWallpaperURL } from './scripts/api/bingWallpaper'
import { verifyImageUrl } from './scripts/img'
import { reloadBackgroundImage, useSettingsStore, useBgSwtichStore } from './scripts/store'
import { BgType } from './scripts/settings'

useColorMode()
const settingsStore = useSettingsStore()
const switchStore = useBgSwtichStore()
const SettingsPageRef = ref<InstanceType<typeof SettingsPage>>()
const ChangelogRef = ref<InstanceType<typeof Changelog>>()

const bgURL = ref('')

async function loadLocalBackground() {
  if (settingsStore.localBackground.url) {
    const verifyBackground = await verifyImageUrl(settingsStore.localBackground.url)
    if (!verifyBackground) {
      await reloadBackgroundImage()
    }
  } else {
    await reloadBackgroundImage()
  }

  bgURL.value = settingsStore.localBackground.url ? `url(${settingsStore.localBackground.url})` : ''
}

onMounted(async () => {
  if (settingsStore.pluginVersion !== version) {
    ChangelogRef.value?.show()
  }

  switch (settingsStore.background.bgType) {
    case BgType.Bing:
      bgURL.value = `url(${await getBingWallpaperURL()})`
      break
    case BgType.Local:
      await loadLocalBackground()
      break
    case BgType.Online:
      bgURL.value = `url(${settingsStore.background.onlineUrl})`
      break
  }

  watch(
    () => settingsStore.background.bgType,
    async () => {
      switchStore.start()
      await promiseTimeout(300)
      bgURL.value = ''
      switch (settingsStore.background.bgType) {
        case BgType.Bing:
          bgURL.value = `url(${await getBingWallpaperURL()})`
          break
        case BgType.Local:
          await loadLocalBackground()
          break
        case BgType.None:
          bgURL.value = ''
          break
        case BgType.Online:
          bgURL.value = `url(${settingsStore.background.onlineUrl})`
          break
      }
      switchStore.end()
    }
  )

  watch(
    () => settingsStore.localBackground.url,
    async () => {
      switchStore.start()
      await promiseTimeout(500)
      bgURL.value = `url(${settingsStore.localBackground.url})`
      switchStore.end()
    }
  )

  watch(
    () => settingsStore.background.onlineUrl,
    async () => {
      switchStore.start()
      await promiseTimeout(500)
      bgURL.value = `url(${settingsStore.background.onlineUrl})`
      switchStore.end()
    }
  )
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <main
      :style="{
        justifyContent: settingsStore.quickStart.enabled ? 'center' : undefined,
        paddingTop: settingsStore.quickStart.enabled ? undefined : '30vh'
      }"
    >
      <time-now />
      <search-box style="margin-top: 10px" />
      <quick-start v-if="settingsStore.quickStart.enabled" />
      <yi-yan />
    </main>
    <background :url="bgURL" />
    <div
      class="settings-icon"
      @click="SettingsPageRef?.toggleShow"
      @contextmenu.prevent.stop="ChangelogRef?.show"
    >
      <el-icon><settings-outlined /></el-icon>
    </div>
    <settings-page ref="SettingsPageRef" />
    <changelog ref="ChangelogRef" />
  </el-config-provider>
</template>

<style scoped lang="scss">
main {
  display: flex;
  flex-direction: column;
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
    transition: none;
  }
}
</style>
