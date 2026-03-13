import { defineStore } from 'pinia'

import type { CURRENT_CONFIG_SCHEMA } from '../settings'
import { defaultSettings } from '../settings'
import { settingsStorage } from './settingsStorage'

export async function initSettings() {
  const settings = await settingsStorage.getValue()
  console.log('[Settings] Initializing settings storage with config version', settings.version)

  // 清除过期的 blob url，避免使用失效的 URL
  settings.background.local.url = ''
  settings.background.localDark.url = ''
  settings.background.bing.url = ''

  useSettingsStore().$patch(settings)

  // 监听其他标签页对设置的更改，实时同步到当前标签页的 store
  settingsStorage.watch((newSettings) => {
    if (!newSettings) return
    useSettingsStore().$patch(newSettings)
  })
}

export async function saveSettings(
  settings?: CURRENT_CONFIG_SCHEMA | { $state?: CURRENT_CONFIG_SCHEMA }
) {
  let toSave: CURRENT_CONFIG_SCHEMA | undefined

  if (!settings) {
    toSave = useSettingsStore().$state
  } else if ((settings as unknown as { $state?: CURRENT_CONFIG_SCHEMA }).$state) {
    toSave = (settings as unknown as { $state?: CURRENT_CONFIG_SCHEMA }).$state
  } else {
    toSave = settings as CURRENT_CONFIG_SCHEMA
  }

  await settingsStorage.setValue(toRaw(toSave as CURRENT_CONFIG_SCHEMA))
}

export const useSettingsStore = defineStore('option', {
  state: () => {
    return structuredClone(defaultSettings as CURRENT_CONFIG_SCHEMA)
  }
})
