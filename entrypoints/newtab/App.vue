<script lang="ts" setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import { promiseTimeout, useDark } from '@vueuse/core'

import { HeartFilled } from '@vicons/antd'
import {
  AccessTimeFilledRound,
  HelpFilled,
  InfoRound,
  SearchRound,
  SettingsRound
} from '@vicons/material'
import { ElConfigProvider, ElNotification } from 'element-plus'
import type { Language } from 'element-plus/es/locale'
import en from 'element-plus/es/locale/lang/en.mjs'
import { browser } from 'wxt/browser'

import { i18n } from '#imports'

import { version } from '@/package.json'

import { verifyImageUrl } from '@/shared/image'
import { BgType, reloadBackgroundImage, useSettingsStore } from '@/shared/settings'
import { setSyncEventCallback } from '@/shared/sync/syncDataStore'

import AboutComp from '@newtab/components/About.vue'
import Background from '@newtab/components/Background.vue'
import Changelog from '@newtab/components/Changelog.vue'
import SearchBox from '@newtab/components/SearchBox/index.vue'
import SearchEnginesSwitcher from '@newtab/components/SearchEnginesSwitcher.vue'
import SettingsPage from '@newtab/components/SettingsPage/index.vue'
import Shortcut from '@newtab/components/Shortcut/index.vue'
import TimeNow from '@newtab/components/TimeNow.vue'
import YiYan from '@newtab/components/YiYan.vue'
import { getBingWallpaperURL } from '@newtab/scripts/api/bingWallpaper'
import { useBgSwtichStore } from '@newtab/scripts/store'

const elementZhLocales = import.meta.glob<{ default: Language }>(
  '/node_modules/element-plus/es/locale/lang/zh*.mjs'
)

// 由于考虑面向用户群体，只包含中文、英文
async function loadElementLocale(_locale: string) {
  if (!_locale.startsWith('zh')) {
    return en
  }
  const formattedLocale = _locale.replace('_', '-').toLowerCase()
  const loader =
    elementZhLocales[`/node_modules/element-plus/es/locale/lang/${formattedLocale}.mjs`]

  if (loader) {
    return (await loader()).default
  }
  // Fallback to zh-cn for unsupported zh locales
  return (await import('element-plus/es/locale/lang/zh-cn.mjs')).default
}

const elLocale = ref<Language>()

onBeforeMount(async () => {
  elLocale.value = await loadElementLocale(locale)
})

const locale = browser.i18n.getUILanguage()

const isDark = useDark()
const settingsStore = useSettingsStore()
const switchStore = useBgSwtichStore()
const SettingsPageRef = ref<InstanceType<typeof SettingsPage>>()
const ChangelogRef = ref<InstanceType<typeof Changelog>>()
const AboutRef = ref<InstanceType<typeof AboutComp>>()
const SESwitcherRef = ref<InstanceType<typeof SearchEnginesSwitcher>>()
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
    getURL: async () =>
      isDark.value
        ? `url(${settingsStore.localDarkBackground.url})`
        : `url(${settingsStore.localBackground.url})`,
    verify: async () => {
      const settingsStore = useSettingsStore()
      const { localBackground, localDarkBackground } = settingsStore

      // 如果没 url，则尝试加载
      if (!localBackground.url) {
        await reloadBackgroundImage(false)
        if (!localDarkBackground.id) return true
      }
      if (localDarkBackground.id && !localDarkBackground.url) {
        await reloadBackgroundImage(true)
        return true
      }

      // 校验 URL 是否有效
      const [isValid, isValidDark] = await Promise.all([
        verifyImageUrl(localBackground.url),
        localDarkBackground.url ? verifyImageUrl(localDarkBackground.url) : Promise.resolve(true) //（此处假设深色模式壁纸存在，不存在也返回true）
      ])

      // 如无效则重新加载
      if (!isValid) {
        await reloadBackgroundImage(false)
      }
      if (!isValidDark && localDarkBackground.id) {
        await reloadBackgroundImage(true)
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
  if (provider.verify) {
    await provider.verify()
  }
  const newUrl = await provider.getURL()

  // 等待过渡动画
  await promiseTimeout(200)
  bgURL.value = ''
  // 不直接赋值时因为避免看到壁纸变形
  bgURL.value = newUrl

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
        title: i18n.t('sync.failMessage.title'),
        message: i18n.t('sync.failMessage.message', [p.cloud, p.local]),
        type: 'error'
      })
    } else if (type === 'sync-error') {
      const err = payload as Error
      ElNotification({
        title: i18n.t('sync.errorMessage.title'),
        message: err.message || 'Unknown error.',
        type: 'error'
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

watch(isDark, async (darked) => {
  if (settingsStore.background.bgType !== BgType.Local) return
  if (settingsStore.localBackground?.id == null || settingsStore.localBackground?.id === '') return
  await bgTypeProviders[BgType.Local].verify?.()
  switchStore.start()
  await promiseTimeout(500)
  if (darked) {
    bgURL.value = `url(${settingsStore.localDarkBackground.url})`
  } else {
    bgURL.value = `url(${settingsStore.localBackground.url})`
  }
  switchStore.end()
})

function sponsorMessage() {
  ElMessageBox.alert(i18n.t('newtab.sponsor'), '支持我们')
}

function needHelp() {
  window.open('https://github.com/Redlnn/lemon-new-tab-page/issues/new')
}
</script>

<template>
  <el-config-provider
    :locale="elLocale"
    :dialog="{ transition: 'dialog-bounce', alignCenter: true }"
  >
    <main
      :style="[
        settingsStore.shortcut.enabled ? { justifyContent: 'center' } : { paddingTop: '30vh' }
      ]"
      class="app"
    >
      <time-now />
      <search-box style="margin-top: 10px" />
      <shortcut v-if="settingsStore.shortcut.enabled" />
      <yi-yan />
    </main>
    <background :url="bgURL" />
    <el-dropdown
      style="display: block"
      popper-class="settings-icon__popper"
      placement="top-end"
      trigger="click"
      @contextmenu.prevent.stop
    >
      <div class="settings-icon">
        <el-icon><settings-round /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="SettingsPageRef?.toggle">
            <el-icon :size="17"><settings-round /></el-icon>
            {{ i18n.t('newtab.menu.settings') }}
          </el-dropdown-item>
          <el-dropdown-item @click="SESwitcherRef?.show">
            <el-icon :size="17"><search-round /></el-icon>
            {{ i18n.t('newtab.menu.searchEnginePreference') }}
          </el-dropdown-item>
          <el-dropdown-item divided @click="ChangelogRef?.show">
            <el-icon :size="17"><access-time-filled-round /></el-icon>
            {{ i18n.t('newtab.menu.changelog') }}
          </el-dropdown-item>
          <el-dropdown-item @click="needHelp">
            <el-icon :size="17"><help-filled /></el-icon>
            {{ i18n.t('newtab.menu.help') }}
          </el-dropdown-item>
          <el-dropdown-item @click="sponsorMessage">
            <el-icon :size="17"><heart-filled /></el-icon>
            {{ i18n.t('newtab.menu.sponsor') }}
          </el-dropdown-item>
          <el-dropdown-item divided @click="AboutRef?.toggle">
            <el-icon :size="17"><info-round /></el-icon>
            {{ i18n.t('newtab.menu.about') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <settings-page ref="SettingsPageRef" />
    <Changelog ref="ChangelogRef" />
    <about-comp ref="AboutRef" />
    <search-engines-switcher ref="SESwitcherRef" />
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
  color: color-mix(in srgb, var(--el-text-color-primary), transparent 60%);
  cursor: pointer;
  background-color: color-mix(in srgb, var(--el-bg-color), transparent 85%);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  transition: 0.1s;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-bg-color);
    box-shadow: var(--el-box-shadow-lighter);
    transform: rotate(180deg);
  }

  &__popper {
    &.el-popper {
      background-color: color-mix(in srgb, var(--el-bg-color-overlay), transparent 30%);
      backdrop-filter: blur(10px) saturate(150%) brightness(110%);
    }

    .el-dropdown-menu {
      padding: 8px 10px;
      background-color: transparent;
    }

    .el-dropdown-menu__item {
      padding: 5px 18px 5px 10px;
      font-size: var(--el-font-size-extra-small);
      border-radius: 6px;

      .el-icon {
        margin-right: 10px;
      }
    }
  }
}

/* Bounce Animation */
.dialog-bounce-enter-active,
.dialog-bounce-enter-active .el-dialog {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dialog-bounce-leave-active,
.dialog-bounce-leave-active .el-dialog {
  transition: all 0.2s cubic-bezier(0.2, 0, 1, 0.4);
}

.dialog-bounce-enter-from,
.dialog-bounce-leave-to {
  opacity: 0;
}

.dialog-bounce-enter-from .el-dialog,
.dialog-bounce-leave-to .el-dialog {
  opacity: 0;
  transform: scale(0.3) translateY(-50px);
}
</style>
