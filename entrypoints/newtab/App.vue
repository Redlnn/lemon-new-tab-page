<script lang="ts" setup>
import { useColorMode, usePreferredDark } from '@vueuse/core'

import type { Language } from 'element-plus/es/locale'
import { useTranslation } from 'i18next-vue'

import { version } from '@/package.json'

import { OPEN_SEARCH_ENGINE_PREFERENCE } from '@/shared/keys'
import { getLang } from '@/shared/lang'
import { useSettingsStore } from '@/shared/settings'
import { setSyncEventCallback } from '@/shared/sync/syncDataStore'

import type AboutCompComponent from '@newtab/components/About.vue'
import Background from '@newtab/components/Background.vue'
import type ChangelogComponent from '@newtab/components/Changelog.vue'
import Clock from '@newtab/components/Clock.vue'
import SearchBox from '@newtab/components/SearchBox/index.vue'
import type SearchEnginesSwitcherComponent from '@newtab/components/SearchEnginesSwitcher/index.vue'
import SettingsBtn from '@newtab/components/SettingsBtn.vue'
import type SettingsPageComponent from '@newtab/components/SettingsPage/index.vue'
import Shortcut from '@newtab/components/Shortcut/index.vue'
import YiYan from '@newtab/components/YiYan.vue'

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

type SettingsPageInstance = InstanceType<typeof SettingsPageComponent>
type ChangelogInstance = InstanceType<typeof ChangelogComponent>
type FaqInstance = InstanceType<typeof Faq>
type AboutCompInstance = InstanceType<typeof AboutCompComponent>
type SearchEnginesSwitcherInstance = InstanceType<typeof SearchEnginesSwitcherComponent>

const SettingsPageRef = ref<SettingsPageInstance>()
const ChangelogRef = ref<ChangelogInstance>()
const FaqRef = ref<FaqInstance>()
const AboutRef = ref<AboutCompInstance>()
const SESwitcherRef = ref<SearchEnginesSwitcherInstance>()

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

provide(OPEN_SEARCH_ENGINE_PREFERENCE, () => SESwitcherRef.value?.show())
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
      <clock v-if="settings.time.enabled" />
      <search-box v-if="settings.search.enabled" />
      <shortcut v-if="settings.shortcut.enabled" />
      <yi-yan v-if="settings.yiyan.enabled" />
    </main>
    <background />
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
  </el-config-provider>
</template>
