<script lang="ts" setup>
import { version } from '@/package.json'

import { SettingsOutlined } from '@vicons/material'
import zhCn from 'element-plus/es/locale/lang/zh-cn.mjs'
import { ElConfigProvider, ElNotification } from 'element-plus'
import { onBeforeMount, ref, toRaw, watch } from 'vue'
import { useColorMode, useDebounceFn } from '@vueuse/core'

import Background from './components/Background.vue'
import QuickStart from './components/QuickStart/index.vue'
import SearchBox from './components/SearchBox/index.vue'
import SettingsPage from './components/SettingsPage/index.vue'
import TimeNow from './components/TimeNow.vue'
import YiYan from './components/YiYan.vue'

import changeTheme from './js/use-element-plus-theme'
import changelog from './changelog'
import { getBingWallpaperURL } from './js/api/bingWallpaper'
import { verifyImageUrl } from './js/utils/img'
import {
  BgType,
  initSettings,
  reloadBackgroundImage,
  saveSettings,
  useSettingsStore
} from './js/store/settingsStore'

useColorMode()
const settingsStore = useSettingsStore()
const SettingsPageRef = ref<InstanceType<typeof SettingsPage>>()

const bgURL = ref('')

onBeforeMount(async () => {
  await initSettings()
  changeTheme(settingsStore.primaryColor)

  switch (settingsStore.background.bgType) {
    case BgType.Bing:
      bgURL.value = `url(${await getBingWallpaperURL()})`
      break
    case BgType.Local:
      if (settingsStore.localBackground.bgUrl) {
        const verifyBackground = await verifyImageUrl(settingsStore.localBackground.bgUrl)
        if (!verifyBackground) {
          await reloadBackgroundImage()
        }
      } else {
        await reloadBackgroundImage()
      }

      bgURL.value = settingsStore.localBackground.bgUrl
        ? `url(${settingsStore.localBackground.bgUrl})`
        : ''
      break
  }

  if (settingsStore.pluginVersion !== version) {
    ElNotification({
      title: `柠檬起始页已更新至 v${version}`,
      message: changelog,
      type: 'success',
      duration: 5000,
      onClose: () => {
        settingsStore.pluginVersion = version
      }
    })
  }
})

watch(
  () => settingsStore.background.bgType,
  async () => {
    switch (settingsStore.background.bgType) {
      case BgType.Bing:
        bgURL.value = `url(${await getBingWallpaperURL()})`
        break
      case BgType.Local:
        bgURL.value = `url(${settingsStore.localBackground.bgUrl})`
        break
      case BgType.None:
        bgURL.value = ''
        break
    }
  }
)
watch(
  () => settingsStore.localBackground.bgUrl,
  () => (bgURL.value = `url(${settingsStore.localBackground.bgUrl})`)
)

const saveSettingsDebounced = useDebounceFn(saveSettings, 100)

settingsStore.$subscribe(async (mutation, state) => {
  await saveSettingsDebounced(toRaw(state))
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <main>
      <time-now />
      <search-box style="margin-top: 10px" />
      <quick-start v-if="settingsStore.quickStart.enabled" />
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
