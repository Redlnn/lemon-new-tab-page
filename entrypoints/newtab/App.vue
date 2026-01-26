<script lang="ts" setup>
import { useColorMode, usePreferredDark } from '@vueuse/core'

import type { Language } from 'element-plus/es/locale'
import { useTranslation } from 'i18next-vue'

import { version } from '@/package.json'

import { getLang } from '@/shared/i18n'
import { useSettingsStore } from '@/shared/settings'
import { setSyncEventCallback } from '@/shared/sync/syncDataStore'

import { OPEN_BACKGROUND_PREFERENCE, OPEN_SEARCH_ENGINE_PREFERENCE } from '@newtab/shared/keys'

import type AboutCompComponent from './components/About.vue'
import Background from './components/Background.vue'
import type BackgroundSwitcherComponent from './components/BackgroundSwitcher/index.vue'
import Bookmark from './components/Bookmark/index.vue'
import BookmarkBtn from './components/BookmarkBtn.vue'
import type ChangelogComponent from './components/Changelog.vue'
import Clock from './components/Clock.vue'
import PermissionDialog from './components/PermissionDialog.vue'
import SearchBox from './components/SearchBox/index.vue'
import type SearchEnginesSwitcherComponent from './components/SearchEnginesSwitcher/index.vue'
import SettingsBtn from './components/SettingsBtn.vue'
import type SettingsPageComponent from './components/SettingsPage/index.vue'
import Shortcut from './components/Shortcut/index.vue'
import YiYan from './components/YiYan.vue'
import { usePermission } from './composables/usePermission'

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
const BackgroundSwitcher = defineAsyncComponent(
  () => import('@newtab/components/BackgroundSwitcher/index.vue')
)

type SettingsPageInstance = InstanceType<typeof SettingsPageComponent>
type ChangelogInstance = InstanceType<typeof ChangelogComponent>
type FaqInstance = InstanceType<typeof Faq>
type AboutCompInstance = InstanceType<typeof AboutCompComponent>
type SearchEnginesSwitcherInstance = InstanceType<typeof SearchEnginesSwitcherComponent>
type BackgroundSwitcherInstance = InstanceType<typeof BackgroundSwitcherComponent>
type BookmarkInstance = InstanceType<typeof Bookmark>

const SettingsPageRef = ref<SettingsPageInstance>()
const ChangelogRef = ref<ChangelogInstance>()
const FaqRef = ref<FaqInstance>()
const AboutRef = ref<AboutCompInstance>()
const SESwitcherRef = ref<SearchEnginesSwitcherInstance>()
const BGSwticherRef = ref<BackgroundSwitcherInstance>()
const BookmarkRef = ref<BookmarkInstance>()

const settings = useSettingsStore()

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

  // 注册同步事件回调
  setSyncEventCallback((type, payload) => {
    if (type === 'version-mismatch') {
      const p = payload as { cloud: string; local: string }
      ElNotification.error({
        title: t('failMessage.title'),
        message: t('failMessage.message', { cloud: p.cloud, local: p.local })
      })
    } else if (type === 'sync-error') {
      const err = payload as Error
      ElNotification.error({
        title: t('errorMessage.title'),
        message: err.message || 'Unknown error.'
      })
    }
  })
})

// 合并DOM类名切换的watch，使用统一的工具函数
function toggleDocumentClass(className: string, shouldAdd: boolean) {
  document.documentElement.classList.toggle(className, shouldAdd)
}

watch(
  () => settings.theme.colorfulMode,
  (colorful) => {
    toggleDocumentClass('colorful', colorful)
  },
  { immediate: true }
)

watch(
  () => settings.perf.disableDialogTransparent,
  (disabled) => {
    toggleDocumentClass('dialog-transparent', !disabled)
  },
  { immediate: true }
)

watch(
  () => settings.perf.disableDialogBlur,
  (disabled) => {
    toggleDocumentClass('dialog-acrylic', !disabled)
  },
  { immediate: true }
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

function openBookmarkSidebar() {
  if (settings.bookmark.rightClickToOpen) {
    BookmarkRef.value?.show()
  }
}

provide(OPEN_SEARCH_ENGINE_PREFERENCE, () => SESwitcherRef.value?.show())
provide(OPEN_BACKGROUND_PREFERENCE, () => BGSwticherRef.value?.show())

const { permissionDialogVisible, currentHostname, onPermissionDialogResult } = usePermission()
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
      @contextmenu.stop.prevent="openBookmarkSidebar"
    >
      <clock v-if="settings.clock.enabled" @contextmenu.stop />
      <search-box v-if="settings.search.enabled" @contextmenu.stop />
      <shortcut v-if="settings.shortcut.enabled" @contextmenu.stop />
      <yi-yan v-if="settings.yiyan.enabled" @contextmenu.stop />
    </main>
    <background />
    <settings-btn
      @open-settings="SettingsPageRef?.toggle"
      @open-changelog="ChangelogRef?.show"
      @open-about="AboutRef?.toggle"
      @open-search-engine-preference="SESwitcherRef?.show"
      @open-faq="FaqRef?.show"
      @open-background-switcher="BGSwticherRef?.show"
    />
    <bookmark-btn v-if="!settings.bookmark.hideBtn" @open-bookmark-sidebar="BookmarkRef?.show" />
    <settings-page ref="SettingsPageRef" />
    <changelog ref="ChangelogRef" />
    <faq ref="FaqRef" />
    <about-comp ref="AboutRef" />
    <search-engines-switcher ref="SESwitcherRef" />
    <background-switcher ref="BGSwticherRef" />
    <bookmark ref="BookmarkRef" />
    <PermissionDialog
      v-model="permissionDialogVisible"
      :hostname="currentHostname"
      @result="onPermissionDialogResult"
    />
  </el-config-provider>
</template>
