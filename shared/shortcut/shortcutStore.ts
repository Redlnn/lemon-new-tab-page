import { defineStore } from 'pinia'

import { acquireFaviconRef } from '@/shared/media'

import { defaultShortcuts, type Shortcuts, shortcutStorage } from './shortcutStorage'

export const useShortcutStore = defineStore('shortcut', {
  state: () => {
    return structuredClone(defaultShortcuts)
  },

  actions: {
    async init(options?: { acquire?: boolean }) {
      const shortcut = await shortcutStorage.getValue()
      this.$patch(shortcut)
      if (options?.acquire ?? true) {
        shortcut.items.forEach((item) => acquireFaviconRef(item.url))
      }
    },

    async save(data?: Shortcuts) {
      if (data) {
        this.$patch({ items: data.items })
      }
      const rawItems = toRaw(this.$state).items
      await shortcutStorage.setValue({ items: rawItems })
    },
  },
})
