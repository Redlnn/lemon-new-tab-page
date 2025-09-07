import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import { isImageFile } from '@/shared/image'
import { settingsStorage } from './settingsStorage'
import { useWallpaperStore, useDarkWallpaperStore } from './wallpaperStore'
import type {
  OldSettingsInterface,
  SettingsInterfaceVer2,
  SettingsInterfaceVer6
} from '../settings/types'
import { migrateFromVer1, defaultSettings, type CURRENT_CONFIG_INTERFACE } from '../settings'

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
): Promise<SettingsInterfaceVer6 | null> {
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
    return migrateFromVer1(oldSettings)
  }

  return null
}

export async function initSettings() {
  let settings
  if (import.meta.env.CHROME || import.meta.env.EDGE) {
    const oldSettings: { settings: OldStorageSettings | null } = await chrome.storage.local.get({
      settings: null
    })

    if (oldSettings.settings && !('pluginVersion' in oldSettings.settings)) {
      // 迁移旧版本设置
      const migratedSettings = await migrateSettings(oldSettings.settings)
      console.log('Initializing settings storage with config version', oldSettings.settings.version)
      if (migratedSettings) {
        settings = migratedSettings
        await saveSettings(settings)
      }
    }
  }

  if (!settings) {
    settings = await settingsStorage.getValue()
    console.log('Initializing settings storage with config version', settings.version)
  }

  const settingsStore = useSettingsStore()
  settingsStore.$patch(settings)
}

export async function saveSettings(settings: CURRENT_CONFIG_INTERFACE) {
  await settingsStorage.setValue(settings)
}

export const useSettingsStore = defineStore('opiton', {
  state: () => {
    return structuredClone(defaultSettings)
  }
})

export async function uploadBackgroundImage(imageFile: File, isDarkMode = false) {
  const settingsStore = useSettingsStore()

  const id = uuidv4()
  const url = URL.createObjectURL(imageFile)

  // 根据模式选择对应的 store & state
  const store = isDarkMode ? useDarkWallpaperStore : useWallpaperStore
  const backgroundKey = isDarkMode ? 'localDarkBackground' : 'localBackground'
  const prevUrl = settingsStore[backgroundKey]?.url || ''

  // 清除上次壁纸，ObjectURL可能导致内存溢出
  await Promise.all([useWallpaperStore.clear(), useDarkWallpaperStore.clear()])
  if (prevUrl.startsWith('blob:')) {
    URL.revokeObjectURL(prevUrl)
  }

  // 保存图片到 IndexedDB 并更新状态
  await store.setItem<Blob>(id, imageFile)
  settingsStore[backgroundKey] = { id, url }
}

export async function reloadBackgroundImage(isDarkMode = false) {
  const settingsStore = useSettingsStore()

  // 根据模式选择对应的 store & state
  const store = isDarkMode ? useDarkWallpaperStore : useWallpaperStore
  const backgroundKey = isDarkMode ? 'localDarkBackground' : 'localBackground'
  const background = settingsStore[backgroundKey]

  if (!background?.id) {
    return
  }

  const file = await store.getItem<Blob>(background.id)

  // 校验图片数据是否可用，否则删除该数据
  if (file && isImageFile(file)) {
    const url = URL.createObjectURL(file)
    background.url = url
  } else {
    if (background.url?.startsWith('blob:')) {
      URL.revokeObjectURL(background.url)
    }
    background.id = ''
    background.url = ''
    await store.removeItem(background.id)
  }
}
