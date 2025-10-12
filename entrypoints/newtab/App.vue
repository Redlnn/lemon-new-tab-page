<script lang="ts" setup>
import { defineAsyncComponent, onBeforeMount, onMounted, ref, watch } from 'vue'
import { promiseTimeout, useDark } from '@vueuse/core'

import type { Language } from 'element-plus/es/locale'
import i18next from 'i18next'
import { useTranslation } from 'i18next-vue'

import { version } from '@/package.json'

import SettingsBtn from '@/entrypoints/newtab/components/SettingsBtn.vue'
import { getLang } from '@/shared/lang'
import { verifyImageUrl } from '@/shared/media'
import { BgType, reloadBackgroundImage, useSettingsStore } from '@/shared/settings'
import { setSyncEventCallback } from '@/shared/sync/syncDataStore'

import type AboutCompComponent from '@newtab/components/About.vue'
import Background from '@newtab/components/Background.vue'
import type ChangelogComponent from '@newtab/components/Changelog.vue'
import SearchBox from '@newtab/components/SearchBox/index.vue'
import type SearchEnginesSwitcherComponent from '@newtab/components/SearchEnginesSwitcher.vue'
import type SettingsPageComponent from '@newtab/components/SettingsPage/index.vue'
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
  const formattedLocale = getLang().toLowerCase()
  const loader =
    elementZhLocales[`/node_modules/element-plus/es/locale/lang/${formattedLocale}.mjs`]

  if (loader) {
    return (await loader()).default
  }

  // 当遇到不支持的 zh 语言时，回退到 zh-cn
  return (await import('element-plus/es/locale/lang/zh-cn.mjs')).default
}

const elLocale = ref<Language>()

onBeforeMount(async () => {
  if (getLang().startsWith('zh')) {
    elLocale.value = await loadElementLocale()
  }
})

// 在语言切换时同步 Element Plus 语言包（仅中文按需加载，英文使用默认）
const onLngChanged = async (lng: string) => {
  if (lng?.startsWith('zh')) {
    elLocale.value = await loadElementLocale()
  } else {
    elLocale.value = undefined
  }
}
i18next.on('languageChanged', onLngChanged)

const SettingsPage = defineAsyncComponent(() => import('@newtab/components/SettingsPage/index.vue'))
const Changelog = defineAsyncComponent(() => import('@newtab/components/Changelog.vue'))
const AboutComp = defineAsyncComponent(() => import('@newtab/components/About.vue'))
const SearchEnginesSwitcher = defineAsyncComponent(
  () => import('@newtab/components/SearchEnginesSwitcher.vue')
)

type SettingsPageInstance = InstanceType<typeof SettingsPageComponent>
type ChangelogInstance = InstanceType<typeof ChangelogComponent>
type AboutCompInstance = InstanceType<typeof AboutCompComponent>
type SearchEnginesSwitcherInstance = InstanceType<typeof SearchEnginesSwitcherComponent>

const SettingsPageRef = ref<SettingsPageInstance>()
const ChangelogRef = ref<ChangelogInstance>()
const AboutRef = ref<AboutCompInstance>()
const SESwitcherRef = ref<SearchEnginesSwitcherInstance>()

const isDark = useDark()
const settings = useSettingsStore()
const switchStore = useBgSwtichStore()
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
        ? settings.localDarkBackground.id
          ? settings.localDarkBackground.url
          : settings.localBackground.url
        : settings.localBackground.url,
    verify: async () => {
      const { localBackground, localDarkBackground } = useSettingsStore()

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
    getURL: () => Promise.resolve(settings.background.onlineUrl)
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

function parseMajorMinor(value: string): [number, number] | null {
  const [majorStr, minorStr] = value.split('.')
  if (majorStr == null || minorStr == null) return null
  const major = Number(majorStr)
  const minor = Number(minorStr)
  if (Number.isNaN(major) || Number.isNaN(minor)) return null
  return [major, minor]
}

function shouldShowChangelog(previousVersion: string, nextVersion: string): boolean {
  const nextMajorMinor = parseMajorMinor(nextVersion)
  if (!nextMajorMinor) return false
  const previousMajorMinor = parseMajorMinor(previousVersion)
  if (!previousMajorMinor) return true
  if (previousMajorMinor[0] < nextMajorMinor[0]) return true
  if (previousMajorMinor[0] > nextMajorMinor[0]) return false
  return previousMajorMinor[1] < nextMajorMinor[1]
}

onMounted(async () => {
  if (settings.pluginVersion !== version) {
    settings.readChangeLog = false
    ElMessage.primary(t('newtab:changelog.newVersionMsg', { version }))

    if (shouldShowChangelog(settings.pluginVersion, version)) {
      watch(
        () => ChangelogRef.value,
        (instance) => {
          if (!instance) return
          instance.show()
        },
        { once: true, flush: 'post' }
      )
    } else {
      settings.pluginVersion = version
    }
  }

  if (!settings.perf.disableDialogTransparent) {
    document.documentElement.classList.add('dialog-transparent')
  }

  if (!settings.perf.disableDialogTransparent && !settings.perf.disableDialogBlur) {
    document.documentElement.classList.add('dialog-acrylic')
  }

  if (settings.colorfulMode) {
    document.documentElement.classList.add('colorful')
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

  await updateBackgroundURL(settings.background.bgType)
})

watch(
  () => settings.colorfulMode,
  (colorful) => {
    if (colorful) {
      document.documentElement.classList.add('colorful')
    } else {
      document.documentElement.classList.remove('colorful')
    }
  }
)

watch(
  () => settings.perf.disableDialogTransparent,
  () => {
    if (settings.perf.disableDialogTransparent) {
      document.documentElement.classList.remove('dialog-transparent')
    } else {
      document.documentElement.classList.add('dialog-transparent')
    }
  }
)

watch(
  () => settings.perf.disableDialogBlur,
  () => {
    if (settings.perf.disableDialogBlur) {
      document.documentElement.classList.remove('dialog-acrylic')
    } else {
      document.documentElement.classList.add('dialog-acrylic')
    }
  }
)

watch(() => settings.background.bgType, updateBackgroundURL)

watch(
  () => settings.localBackground.url,
  async () => {
    if (settings.background.bgType !== BgType.Local) return
    if (isDark.value && settings.localDarkBackground?.id) return
    switchStore.start()
    await promiseTimeout(500)
    bgURL.value = settings.localBackground.url
    switchStore.end()
  }
)

watch(
  () => settings.localDarkBackground.url,
  async () => {
    if (settings.background.bgType !== BgType.Local) return
    if (!isDark.value) return
    switchStore.start()
    await promiseTimeout(500)
    bgURL.value = settings.localDarkBackground.id
      ? settings.localDarkBackground.url
      : settings.localBackground.url
    switchStore.end()
  }
)

watch(
  () => settings.background.onlineUrl,
  async () => {
    if (settings.background.bgType !== BgType.Online) return
    switchStore.start()
    await promiseTimeout(500)
    bgURL.value = settings.background.onlineUrl
    switchStore.end()
  }
)

watch(isDark, async (darked) => {
  if (settings.background.bgType !== BgType.Local) return
  if (settings.localDarkBackground?.id == null || settings.localDarkBackground?.id === '') return
  await bgTypeProviders[BgType.Local].verify?.()
  switchStore.start()
  await promiseTimeout(500)
  if (darked) {
    bgURL.value = settings.localDarkBackground.url
  } else {
    bgURL.value = settings.localBackground.url
  }
  switchStore.end()
})
</script>

<template>
  <el-config-provider
    :locale="elLocale"
    :dialog="{
      transition: settings.perf.disableDialogAnimation ? 'none' : 'dialog',
      alignCenter: true
    }"
    :message="{
      placement: 'bottom'
    }"
  >
    <main
      :style="[settings.shortcut.enabled ? { justifyContent: 'center' } : { paddingTop: '30vh' }]"
      class="app"
    >
      <time-now />
      <search-box style="margin-top: 10px" />
      <shortcut v-if="settings.shortcut.enabled" />
      <yi-yan />
    </main>
    <background :url="bgURL" />
    <settings-btn
      @open-settings="SettingsPageRef?.toggle"
      @open-changelog="ChangelogRef?.show"
      @open-about="AboutRef?.toggle"
      @open-search-engine-preference="SESwitcherRef?.show"
    />
    <settings-page ref="SettingsPageRef" />
    <Changelog ref="ChangelogRef" />
    <about-comp ref="AboutRef" />
    <search-engines-switcher ref="SESwitcherRef" />
  </el-config-provider>
</template>
