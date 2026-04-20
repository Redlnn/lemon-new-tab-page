import { defineStore } from 'pinia'

import type { CURRENT_CONFIG_SCHEMA } from '../settings'
import { defaultSettings } from '../settings'

import { settingsStorage } from './settingsStorage'

export const useSettingsStore = defineStore('option', {
  state: () => {
    return structuredClone(defaultSettings as CURRENT_CONFIG_SCHEMA)
  },

  actions: {
    async init() {
      const settings = await settingsStorage.getValue()
      console.log('[Settings] Initializing settings storage with config version', settings.version)

      // 清除过期的 blob url，避免使用失效的 URL
      if (settings.background.local.url) settings.background.local.url = ''
      if (settings.background.localDark.url) settings.background.localDark.url = ''
      if (settings.background.bing.url) settings.background.bing.url = ''

      this.$patch(settings)

      // 监听其他标签页对设置的更改，实时同步到当前标签页的 store
      settingsStorage.watch((newSettings) => {
        if (!newSettings) return
        this.$patch(newSettings)
      })
    },

    async save() {
      await settingsStorage.setValue(toRaw(this.$state))
    },
  },
})
