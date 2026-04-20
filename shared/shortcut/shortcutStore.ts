import { defineStore } from 'pinia'

import { acquireFaviconRef } from '@/shared/media'

import { defaultShortcuts, type Shortcuts, shortcutStorage } from './shortcutStorage'

export const useShortcutStore = defineStore('shortcut', () => {
  const items = ref(structuredClone(defaultShortcuts.items))

  const init = async (options?: { acquire?: boolean }) => {
    const shortcut = await shortcutStorage.getValue()
    items.value = shortcut.items
    if (options?.acquire ?? true) {
      shortcut.items.forEach((item) => acquireFaviconRef(item.url))
    }
  }

  const save = async (data?: Shortcuts) => {
    if (data) {
      items.value = data.items
    }
    await shortcutStorage.setValue({ items: toRaw(items.value) })
  }

  return { items, init, save }
})
