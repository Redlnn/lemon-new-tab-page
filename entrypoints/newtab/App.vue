<script lang="ts" setup>
import { promiseTimeout, useColorMode, useDark, usePreferredDark } from '@vueuse/core'

import type { Language } from 'element-plus/es/locale'
import { useTranslation } from 'i18next-vue'

import { version } from '@/package.json'

import { OPEN_SEARCH_ENGINE_PREFERENCE } from '@/shared/keys'
import { getLang } from '@/shared/lang'
import { verifyImageUrl, verifyVideoUrl } from '@/shared/media'
import { BgType, reloadBackground, useSettingsStore } from '@/shared/settings'
import { setSyncEventCallback } from '@/shared/sync/syncDataStore'

import type AboutCompComponent from '@newtab/components/About.vue'
import Background from '@newtab/components/Background.vue'
import type BookmarkMenuComponent from '@newtab/components/BookmarkMenu/index.vue'
import type ChangelogComponent from '@newtab/components/Changelog.vue'
import Clock from '@newtab/components/Clock.vue'
import SearchBox from '@newtab/components/SearchBox/index.vue'
import type SearchEnginesSwitcherComponent from '@newtab/components/SearchEnginesSwitcher/index.vue'
import SettingsBtn from '@newtab/components/SettingsBtn.vue'
import type SettingsPageComponent from '@newtab/components/SettingsPage/index.vue'
import Shortcut from '@newtab/components/Shortcut/index.vue'
import YiYan from '@newtab/components/YiYan.vue'
import { getBingWallpaperURL } from '@newtab/scripts/api/bingWallpaper'
import { useBgSwtichStore } from '@newtab/scripts/store'

const { t, i18next } = useTranslation('sync')

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
const Faq = defineAsyncComponent(() => import('@newtab/components/Faq.vue'))
const AboutComp = defineAsyncComponent(() => import('@newtab/components/About.vue'))
const SearchEnginesSwitcher = defineAsyncComponent(
  () => import('@newtab/components/SearchEnginesSwitcher/index.vue')
)
const BookmarkMenu = defineAsyncComponent(() => import('@newtab/components/BookmarkMenu/index.vue'))

type SettingsPageInstance = InstanceType<typeof SettingsPageComponent>
type ChangelogInstance = InstanceType<typeof ChangelogComponent>
type FaqInstance = InstanceType<typeof Faq>
type AboutCompInstance = InstanceType<typeof AboutCompComponent>
type SearchEnginesSwitcherInstance = InstanceType<typeof SearchEnginesSwitcherComponent>
type BookmarkMenuInstance = InstanceType<typeof BookmarkMenuComponent>

const SettingsPageRef = ref<SettingsPageInstance>()
const ChangelogRef = ref<ChangelogInstance>()
const FaqRef = ref<FaqInstance>()
const AboutRef = ref<AboutCompInstance>()
const SESwitcherRef = ref<SearchEnginesSwitcherInstance>()
const BookmarkMenuRef = ref<BookmarkMenuInstance>()

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
        await reloadBackground(false)
        if (!localDarkBackground.id) return true
      }
      if (localDarkBackground.id && !localDarkBackground.url) {
        await reloadBackground(true)
        return true
      }

      // 校验 URL 是否有效
      const verifyLight = () => {
        if (localBackground.mediaType === 'image') {
          return verifyImageUrl(localBackground.url)
        }
        if (localBackground.mediaType === 'video') {
          // 对于视频，简单判断 URL 可达即可
          return verifyVideoUrl(localBackground.url)
        }
      }
      const verifyDark = () => {
        if (!localDarkBackground.id) return Promise.resolve(true)
        if (localDarkBackground.mediaType === 'image') {
          return verifyImageUrl(localDarkBackground.url)
        }
        if (localDarkBackground.mediaType === 'video') {
          // 对于视频，简单判断 URL 可达即可
          return verifyVideoUrl(localDarkBackground.url)
        }
      }

      const [isValid, isValidDark] = await Promise.all([verifyLight(), verifyDark()])

      // 如无效则重新加载
      if (!isValid) {
        await reloadBackground(false)
      }
      if (!isValidDark && localDarkBackground.id) {
        await reloadBackground(true)
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
  await promiseTimeout(300)
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

    const canAutoShow = shouldShowChangelog(settings.pluginVersion, version)

    if (canAutoShow && !settings.hideMajorChangelog) {
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
        title: t('failMessage.title'),
        message: t('failMessage.message', { cloud: p.cloud, local: p.local }),
        type: 'error'
      })
    } else if (type === 'sync-error') {
      const err = payload as Error
      ElNotification({
        title: t('errorMessage.title'),
        message: err.message || 'Unknown error.',
        type: 'error'
      })
    }
  })

  await updateBackgroundURL(settings.background.bgType)

  // 初始化时激活当前背景类型的watch
  activateBackgroundWatch(settings.background.bgType)
})

// 合并DOM类名切换的watch，使用统一的工具函数
function toggleDocumentClass(className: string, shouldAdd: boolean) {
  document.documentElement.classList.toggle(className, shouldAdd)
}

watch(
  () => settings.colorfulMode,
  (colorful) => {
    toggleDocumentClass('colorful', colorful)
  }
)

watch(
  () => settings.perf.disableDialogTransparent,
  (disabled) => {
    toggleDocumentClass('dialog-transparent', !disabled)
  }
)

watch(
  () => settings.perf.disableDialogBlur,
  (disabled) => {
    toggleDocumentClass('dialog-acrylic', !disabled)
  }
)

// 动态watch管理 - 根据背景类型激活需要的watch
let stopLocalBgWatch: (() => void) | null = null
let stopOnlineBgWatch: (() => void) | null = null

// 本地背景URL变化处理器
const handleLocalBgChange = async () => {
  const shouldUseDark = isDark.value && settings.localDarkBackground?.id
  const currentUrl = shouldUseDark ? settings.localDarkBackground.url : settings.localBackground.url

  // 只在URL真正变化时才执行切换动画
  if (bgURL.value === currentUrl) return

  if (settings.localDarkBackground?.id) {
    await bgTypeProviders[BgType.Local].verify?.()
  }

  switchStore.start()
  await promiseTimeout(300)
  bgURL.value = ''
  // 不直接赋值是因为避免看到壁纸变形
  bgURL.value = currentUrl
  switchStore.end()
}

// 在线背景URL变化处理器
const handleOnlineBgChange = async (newUrl: string) => {
  if (bgURL.value === newUrl) return

  switchStore.start()
  await promiseTimeout(300)
  bgURL.value = ''
  bgURL.value = newUrl
  switchStore.end()
}

// 根据背景类型激活对应的watch
function activateBackgroundWatch(type: BgType) {
  // 清理旧的watch
  stopLocalBgWatch?.()
  stopOnlineBgWatch?.()
  stopLocalBgWatch = null
  stopOnlineBgWatch = null

  // 根据类型激活对应的watch
  if (type === BgType.Local) {
    // 只在使用本地背景时监听本地背景变化
    stopLocalBgWatch = watch(
      [() => settings.localBackground.url, () => settings.localDarkBackground.url, isDark],
      handleLocalBgChange
    )
  } else if (type === BgType.Online) {
    // 只在使用在线背景时监听在线URL变化
    stopOnlineBgWatch = watch(() => settings.background.onlineUrl, handleOnlineBgChange)
  }
  // Bing和None类型不需要watch，因为它们不会动态变化
}

// 监听背景类型切换，动态激活/停用对应的watch
watch(
  () => settings.background.bgType,
  async (newType) => {
    await updateBackgroundURL(newType)
    activateBackgroundWatch(newType)
  }
)

const preferredDark = usePreferredDark()
const { store } = useColorMode()
watch(preferredDark, () => {
  if (store.value === 'auto') {
    if (preferredDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }
})

// 组件卸载时清理watch
onUnmounted(() => {
  stopLocalBgWatch?.()
  stopOnlineBgWatch?.()
})

provide(OPEN_SEARCH_ENGINE_PREFERENCE, () => SESwitcherRef.value?.show())

/**
 * 处理右键菜单事件，显示书签树
 */
function handleContextMenu(event: MouseEvent) {
  BookmarkMenuRef.value?.show(event)
}
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
      @contextmenu="handleContextMenu"
    >
      <clock v-if="settings.time.enabled" />
      <search-box v-if="settings.search.enabled" />
      <shortcut v-if="settings.shortcut.enabled" />
      <yi-yan v-if="settings.yiyan.enabled" />
    </main>
    <background :url="bgURL" />
    <settings-btn
      @open-settings="SettingsPageRef?.toggle"
      @open-changelog="ChangelogRef?.show"
      @open-about="AboutRef?.toggle"
      @open-search-engine-preference="SESwitcherRef?.show"
      @open-faq="FaqRef?.show"
    />
    <settings-page ref="SettingsPageRef" />
    <changelog ref="ChangelogRef" />
    <faq ref="FaqRef" />
    <about-comp ref="AboutRef" />
    <search-engines-switcher ref="SESwitcherRef" />
    <bookmark-menu ref="BookmarkMenuRef" />
  </el-config-provider>
</template>
