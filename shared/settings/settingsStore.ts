import { defineStore } from 'pinia'

import { browser } from 'wxt/browser'

import { isMediaFile, isVideoFile } from '@/shared/media'

import type {
  CURRENT_CONFIG_INTERFACE,
  OldSettingsInterface,
  SettingsInterfaceVer2
} from '../settings'
import { defaultSettings, migrateFromVer1, migrateFromVer7To8 } from '../settings'
import { settingsStorage } from './settingsStorage'
import { useDarkWallpaperStore, useWallpaperStore } from './wallpaperStore'

const searchSuggestAPIsMap: Record<
  string,
  keyof typeof import('@newtab/scripts/api/search').searchSuggestAPIs
> = {
  百度: 'baidu',
  必应: 'bing',
  谷歌: 'google'
}

type OldStorageSettings = OldSettingsInterface | SettingsInterfaceVer2

async function migrateSettings(
  settings: OldStorageSettings
): Promise<CURRENT_CONFIG_INTERFACE | null> {
  if (!settings.version) {
    settings.version = '0' // 太旧版本可能没有version字段
  }

  // 判断版本类型来确定具体的设置类型
  if (typeof settings.version === 'string') {
    const oldSettings = settings as OldSettingsInterface
    if (searchSuggestAPIsMap[oldSettings.selectedSearchSuggestionAPI]) {
      oldSettings.selectedSearchSuggestionAPI =
        searchSuggestAPIsMap[oldSettings.selectedSearchSuggestionAPI] || 'bing'
    }
    // 从 v1 迁移到 v7，然后再迁移到 v8
    const v7Settings = migrateFromVer1(oldSettings)
    return migrateFromVer7To8(v7Settings)
  }

  return null
}

// 并行化设置初始化，减少冷启动时间
export async function initSettings() {
  let settings

  if (import.meta.env.CHROME || import.meta.env.EDGE) {
    // 并行读取旧设置和新设置
    const [oldSettings, newSettings, wxtSettingsVer] = await Promise.all([
      chrome.storage.local.get({ settings: null }) as Promise<{
        settings: OldStorageSettings | null
      }>,
      settingsStorage.getValue(),
      browser.storage.local.get('settings$')
    ])

    if (oldSettings.settings && !('pluginVersion' in oldSettings.settings)) {
      // 迁移旧版本设置
      const migratedSettings = await migrateSettings(oldSettings.settings)
      console.log(
        '[Settings] Initializing settings storage with config version',
        oldSettings.settings.version
      )
      if (migratedSettings) {
        settings = migratedSettings
      }
    }

    if (!settings) {
      settings = newSettings
      if (wxtSettingsVer.settings$ && settings.version !== wxtSettingsVer.settings$.v) {
        settings.version = wxtSettingsVer.settings$.v
      }
      console.log('[Settings] Initializing settings storage with config version', settings.version)
    }
  } else {
    // Firefox: 并行读取设置
    const [newSettings, wxtSettings] = await Promise.all([
      settingsStorage.getValue(),
      browser.storage.local.get('settings$')
    ])

    settings = newSettings
    if (wxtSettings.settings$ && settings.version !== wxtSettings.settings$.v) {
      settings.version = wxtSettings.settings$.v
    }
    console.log('[Settings] Initializing settings storage with config version', settings.version)
  }

  useSettingsStore().$patch(settings)
}

export async function saveSettings(settings: CURRENT_CONFIG_INTERFACE) {
  await settingsStorage.setValue(toRaw(settings))
}

export const useSettingsStore = defineStore('option', {
  state: () => {
    return structuredClone(defaultSettings)
  }
})

export async function uploadBackground(imageFile: File, isDarkMode = false) {
  const settings = useSettingsStore()

  const id = crypto.randomUUID()
  const url = URL.createObjectURL(imageFile)

  // 根据模式选择对应的 store & state
  const store = isDarkMode ? useDarkWallpaperStore : useWallpaperStore
  const backgroundKey = isDarkMode ? 'localDarkBackground' : 'localBackground'
  const prevUrl = settings[backgroundKey]?.url || ''

  // 清除当前模式上次壁纸（IndexedDB）以节省空间。如果之前的 URL 是 blob:，撤销它
  await store.clear()
  if (prevUrl?.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(prevUrl)
    } catch {}
  }

  // 保存媒体文件到 IndexedDB 并更新状态，记录 mediaType
  const mediaType: 'image' | 'video' = isVideoFile(imageFile) ? 'video' : 'image'
  await store.setItem<Blob>(id, imageFile)
  settings[backgroundKey] = { id, url, mediaType }
}

export async function reloadBackground(isDarkMode = false) {
  const settings = useSettingsStore()

  // 根据模式选择对应的 store & state
  const store = isDarkMode ? useDarkWallpaperStore : useWallpaperStore
  const backgroundKey = isDarkMode ? 'localDarkBackground' : 'localBackground'
  const background = settings[backgroundKey]

  if (!background?.id) {
    return
  }

  URL.revokeObjectURL(background.url)
  const file = await store.getItem<Blob>(background.id)

  // 校验媒体数据是否可用，否则删除该数据
  if (file && isMediaFile(file)) {
    const url = URL.createObjectURL(file)
    // 根据文件类型更新 mediaType（兼容旧数据）
    background.url = url
    if (isVideoFile(file)) {
      Object.assign(background, { mediaType: 'video' })
    } else {
      Object.assign(background, { mediaType: 'image' })
    }
  } else {
    if (background.url?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(background.url)
      } catch {}
    }

    try {
      await store.removeItem(background.id)
    } finally {
      background.id = ''
      background.url = ''
      background.mediaType = undefined
    }
  }
}
