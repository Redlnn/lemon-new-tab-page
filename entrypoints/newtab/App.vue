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
import type { Language } from 'element-plus/es/locale'
import { useTranslation } from 'i18next-vue'

import { version } from '@/package.json'

import { lang } from '@/shared/lang'
import { verifyImageUrl } from '@/shared/media'
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

const { t } = useTranslation()

const elementZhLocales = import.meta.glob<{ default: Language }>(
  '/node_modules/element-plus/es/locale/lang/zh*.mjs'
)

// 由于考虑面向用户群体，只包含中文、英文
async function loadElementLocale(): Promise<Language> {
  const formattedLocale = lang.toLowerCase()
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
  if (lang.startsWith('zh')) {
    elLocale.value = await loadElementLocale()
  }
})

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
    getURL: async () => await getBingWallpaperURL()
  },
  [BgType.Local]: {
    getURL: async () =>
      isDark.value
        ? settingsStore.localDarkBackground.id
          ? settingsStore.localDarkBackground.url
          : settingsStore.localBackground.url
        : settingsStore.localBackground.url,
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
    getURL: () => Promise.resolve(settingsStore.background.onlineUrl)
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
  // 不直接赋值是因为避免看到壁纸变形
  // 直接赋值为原始 URL（Background 组件会决定是否包裹 url()）
  bgURL.value = newUrl

  switchStore.end()
}

onMounted(async () => {
  if (true || (!settingsStore.dontShowChangeLog && settingsStore.pluginVersion !== version)) {
    // ChangelogRef.value?.show()
    // TODO: 用消息提示替代直接弹窗，badge还未联动
    ElMessage.primary(t('newtab:changelog.newVersionMsg', { version }))
    settingsStore.pluginVersion = version
  }

  if (!settingsStore.perf.disableDialogTransparent) {
    document.documentElement.classList.add('dialog-transparent')
  }

  if (!settingsStore.perf.disableDialogTransparent && !settingsStore.perf.disableDialogBlur) {
    document.documentElement.classList.add('dialog-acrylic')
  }

  // 注册同步事件回调
  setSyncEventCallback((type, payload) => {
    if (type === 'version-mismatch') {
      const p = payload as { cloud: string; local: string }
      ElNotification({
        title: t('sync:failMessage.title'),
        message: t('sync:failMessage.message', { cloud: p.cloud, local: p.local }),
        type: 'error'
      })
    } else if (type === 'sync-error') {
      const err = payload as Error
      ElNotification({
        title: t('sync.errorMessage.title'),
        message: err.message || 'Unknown error.',
        type: 'error'
      })
    }
  })

  await updateBackgroundURL(settingsStore.background.bgType)
})

watch(
  () => settingsStore.perf.disableDialogTransparent,
  () => {
    if (settingsStore.perf.disableDialogTransparent) {
      document.documentElement.classList.remove('dialog-transparent')
    } else {
      document.documentElement.classList.add('dialog-transparent')
    }
  }
)

watch(
  () => settingsStore.perf.disableDialogBlur,
  () => {
    if (settingsStore.perf.disableDialogBlur) {
      document.documentElement.classList.remove('dialog-acrylic')
    } else {
      document.documentElement.classList.add('dialog-acrylic')
    }
  }
)

// Watch for background type changes
watch(() => settingsStore.background.bgType, updateBackgroundURL)

// Watch for local background URL changes
watch(
  () => settingsStore.localBackground.url,
  async () => {
    if (settingsStore.background.bgType !== BgType.Local) return
    switchStore.start()
    await promiseTimeout(500)
    bgURL.value = settingsStore.localBackground.url
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
    bgURL.value = settingsStore.background.onlineUrl
    switchStore.end()
  }
)

watch(isDark, async (darked) => {
  if (settingsStore.background.bgType !== BgType.Local) return
  if (settingsStore.localDarkBackground?.id == null || settingsStore.localDarkBackground?.id === '')
    return
  await bgTypeProviders[BgType.Local].verify?.()
  switchStore.start()
  await promiseTimeout(500)
  if (darked) {
    bgURL.value = settingsStore.localDarkBackground.url
  } else {
    bgURL.value = settingsStore.localBackground.url
  }
  switchStore.end()
})

function sponsorMessage() {
  ElMessageBox.alert(t('newtab:sponsor'), '支持我们')
}

function needHelp() {
  window.open('https://github.com/Redlnn/lemon-new-tab-page/issues/new')
}
</script>

<template>
  <el-config-provider
    :locale="elLocale"
    :dialog="{
      transition: settingsStore.perf.disableDialogAnimation ? 'none' : 'dialog',
      alignCenter: true
    }"
    :message="{
      placement: 'bottom'
    }"
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
      <div
        class="settings-icon"
        :class="{
          'settings-icon--tran': !settingsStore.perf.disableSettingsBtnTransparent,
          'settings-icon--blur': !(
            settingsStore.perf.disableSettingsBtnBlur ||
            settingsStore.perf.disableSettingsBtnTransparent
          )
        }"
      >
        <el-badge is-dot :offset="[3, 0]">
          <el-icon><settings-round /></el-icon>
        </el-badge>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="SettingsPageRef?.toggle">
            <el-icon :size="17"><settings-round /></el-icon>
            <span>{{ t('newtab:settings.title') }}</span>
          </el-dropdown-item>
          <el-dropdown-item @click="SESwitcherRef?.show">
            <el-icon :size="17"><search-round /></el-icon>
            <span>{{ t('newtab:menu.searchEnginePreference') }}</span>
          </el-dropdown-item>
          <el-badge is-dot :offset="[-3, 17]" style="width: 100%">
            <el-dropdown-item divided @click="ChangelogRef?.show">
              <el-icon :size="17"><access-time-filled-round /></el-icon>
              <span>{{ t('newtab:changelog.title') }}</span>
            </el-dropdown-item>
          </el-badge>
          <el-dropdown-item @click="needHelp">
            <el-icon :size="17"><help-filled /></el-icon>
            <span>{{ t('newtab:menu.help') }}</span>
          </el-dropdown-item>
          <el-dropdown-item @click="sponsorMessage">
            <el-icon :size="17"><heart-filled /></el-icon>
            <span>{{ t('newtab:menu.sponsor') }}</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click="AboutRef?.toggle">
            <el-icon :size="17"><info-round /></el-icon>
            <span>{{ t('newtab:menu.about') }}</span>
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
  font-size: 25px;
  line-height: 1em;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background-color: var(--el-bg-color);
  border-radius: 50%;
  transition:
    color 0.1s ease,
    background-color var(--el-transition-duration-fast) ease;

  &--blur {
    backdrop-filter: blur(10px) saturate(1.4) brightness(1.1);
  }

  &--tran {
    color: color-mix(in srgb, var(--el-text-color-primary), transparent 65%);
    background-color: color-mix(in srgb, var(--el-bg-color), transparent 85%);

    &:hover {
      background-color: var(--el-bg-color);
    }
  }

  .el-icon {
    transition: transform 0.1s ease;
  }

  &:hover {
    color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-lighter);

    .el-icon {
      transform: rotate(180deg);
    }
  }

  &__popper {
    &.el-popper {
      background-color: color-mix(in srgb, var(--el-bg-color-overlay), transparent 30%);
      backdrop-filter: blur(10px) saturate(1.4) brightness(1.1);
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

.dialog-enter-active,
.dialog-enter-active .el-dialog {
  transition: all 0.15s ease-out;
}

.dialog-leave-active,
.dialog-leave-active .el-dialog {
  transition: all 0.15s ease-in;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .el-dialog,
.dialog-leave-to .el-dialog {
  opacity: 0;
  transform: scale(1.05);
}
</style>
