<script lang="ts" setup>
import { version } from '@/package.json'

import { ElConfigProvider } from 'element-plus'
import { SettingsOutlined } from '@vicons/material'
import { useColorMode, promiseTimeout } from '@vueuse/core'
import zhCn from 'element-plus/es/locale/lang/zh-cn.mjs'
import { onMounted, ref, watch } from 'vue'

import Background from './components/Background.vue'
import Changelog from './components/Changelog.vue'
import Shortcut from './components/Shortcut/index.vue'
import SearchBox from './components/SearchBox/index.vue'
import SettingsPage from './components/SettingsPage/index.vue'
import TimeNow from './components/TimeNow.vue'
import YiYan from './components/YiYan.vue'

import { getBingWallpaperURL } from './scripts/api/bingWallpaper'
import { verifyImageUrl } from '@/shared/image'
import { useBgSwtichStore } from './scripts/store'
import { reloadBackgroundImage, useSettingsStore, BgType } from '@/shared/settings'
import { setSyncEventCallback } from '@/shared/sync/syncDataStore'

useColorMode()
const settingsStore = useSettingsStore()
const switchStore = useBgSwtichStore()
const SettingsPageRef = ref<InstanceType<typeof SettingsPage>>()
const ChangelogRef = ref<InstanceType<typeof Changelog>>()
const bgURL = ref('')

interface BgURLProvider {
  getURL: () => Promise<string>
  verify?: () => Promise<boolean>
}

const bgTypeProviders: Record<BgType, BgURLProvider> = {
  [BgType.Bing]: {
    getURL: async () => `url(${await getBingWallpaperURL()})`
  },
  [BgType.Local]: {
    getURL: async () => `url(${settingsStore.localBackground.url})`,
    verify: async () => {
      if (!settingsStore.localBackground.url) {
        await reloadBackgroundImage()
        return true
      }
      const isValid = await verifyImageUrl(settingsStore.localBackground.url)
      if (!isValid) {
        await reloadBackgroundImage()
      }
      return true
    }
  },
  [BgType.Online]: {
    getURL: () => Promise.resolve(`url(${settingsStore.background.onlineUrl})`)
  },
  [BgType.None]: {
    getURL: () => Promise.resolve('')
  }
}

async function updateBackgroundURL(type: BgType): Promise<void> {
  const provider = bgTypeProviders[type]
  if (!provider) return

  switchStore.start()
  await promiseTimeout(300)
  bgURL.value = ''

  if (provider.verify) {
    await provider.verify()
  }
  bgURL.value = await provider.getURL()

  switchStore.end()
}

onMounted(async () => {
  if (settingsStore.pluginVersion !== version) {
    ChangelogRef.value?.show()
  }

  // 注册同步事件回调
  setSyncEventCallback((type, payload) => {
    if (type === 'version-mismatch') {
      const p = payload as { cloud: string; local: string }
      ElNotification({
        title: '云同步失败',
        message: `云端配置版本(${p.cloud})高于本地(${p.local})，请升级扩展后再使用云同步。`,
        type: 'error',
        duration: 8000
      })
    } else if (type === 'sync-error') {
      const err = payload as Error
      ElNotification({
        title: '云同步异常',
        message: err.message || '未知错误',
        type: 'error',
        duration: 8000
      })
    }
  })

  await updateBackgroundURL(settingsStore.background.bgType)
})

// Watch for background type changes
watch(() => settingsStore.background.bgType, updateBackgroundURL)

// Watch for local background URL changes
watch(
  () => settingsStore.localBackground.url,
  async () => {
    if (settingsStore.background.bgType !== BgType.Local) return
    switchStore.start()
    await promiseTimeout(500)
    bgURL.value = `url(${settingsStore.localBackground.url})`
    switchStore.end()
  }
)

// Watch for online background URL changes
watch(
  () => settingsStore.background.onlineUrl,
  async () => {
    if (settingsStore.background.bgType !== BgType.Online) return
    switchStore.start()
    await promiseTimeout(500)
    bgURL.value = `url(${settingsStore.background.onlineUrl})`
    switchStore.end()
  }
)
</script>

<template>
  <el-config-provider :locale="zhCn">
    <main
      :style="{
        justifyContent: settingsStore.shortcut.enabled ? 'center' : undefined,
        paddingTop: settingsStore.shortcut.enabled ? undefined : '30vh'
      }"
      class="app"
    >
      <time-now />
      <search-box style="margin-top: 10px" />
      <shortcut v-if="settingsStore.shortcut.enabled" />
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

<style lang="scss">
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.settings-icon {
  position: fixed;
  right: 30px;
  bottom: 20px;
  height: calc(1em + 12px);
  padding: 6px;
  overflow: hidden;
  font-size: 25px;
  line-height: 1em;
  color: color-mix(in srgb, var(--el-text-color-primary), transparent 20%);
  cursor: pointer;
  background-color: color-mix(in srgb, var(--el-bg-color), transparent 80%);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  transition: 0.1s;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-bg-color);
    box-shadow: var(--el-box-shadow-lighter);
    transition: none;
  }
}
</style>
