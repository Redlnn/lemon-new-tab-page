import { defineStore } from 'pinia'

import type {
  CURRENT_CONFIG_INTERFACE,
  OldSettingsInterface,
  SettingsInterfaceVer2
} from '../settings'
import { defaultSettings, migrateFromVer1 } from '../settings'
import { settingsStorage } from './settingsStorage'

const searchSuggestAPIsMap: Record<
  string,
  keyof typeof import('@newtab/shared/search').searchSuggestAPIs
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
    return migrateFromVer1(oldSettings)
  }

  return null
}

// 并行化设置初始化，减少冷启动时间
export async function initSettings() {
  let settings

  if (import.meta.env.CHROME || import.meta.env.EDGE) {
    // 并行读取旧设置和新设置
    const [oldSettings, newSettings] = await Promise.all([
      chrome.storage.local.get({ settings: null }) as Promise<{
        settings: OldStorageSettings | null
      }>,
      settingsStorage.getValue()
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
      console.log('[Settings] Initializing settings storage with config version', settings.version)
    }
  } else {
    const newSettings = await settingsStorage.getValue()
    settings = newSettings
    console.log('[Settings] Initializing settings storage with config version', settings.version)
  }

  // 清除过期的 blob url，避免使用失效的 URL
  settings.background.local.url = ''
  settings.background.localDark.url = ''
  settings.background.bing.url = ''

  useSettingsStore().$patch(settings)
}

export async function saveSettings(
  settings?: CURRENT_CONFIG_INTERFACE | { $state?: CURRENT_CONFIG_INTERFACE }
) {
  let toSave: CURRENT_CONFIG_INTERFACE | undefined

  if (!settings) {
    toSave = useSettingsStore().$state
  } else if ((settings as unknown as { $state?: CURRENT_CONFIG_INTERFACE }).$state) {
    toSave = (settings as unknown as { $state?: CURRENT_CONFIG_INTERFACE }).$state
  } else {
    toSave = settings as CURRENT_CONFIG_INTERFACE
  }

  await settingsStorage.setValue(toRaw(toSave as CURRENT_CONFIG_INTERFACE))
}

export const useSettingsStore = defineStore('option', {
  state: () => {
    return structuredClone(defaultSettings)
  }
})
