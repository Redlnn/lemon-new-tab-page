import { defineStore } from 'pinia'

import { acquireFaviconRef } from '@/shared/media'

import { defaultShortcuts, type Shortcuts, shortcutStorage } from './shortcutStorage'

export async function initShortcut(options?: { acquire?: boolean }) {
  const shortcut = await shortcutStorage.getValue()
  const shortcutStore = useShortcutStore()
  shortcutStore.$patch(shortcut)
  const shouldAcquire = options?.acquire ?? true
  if (shouldAcquire) {
    shortcut.items.forEach((item) => acquireFaviconRef(item.url))
  }
}

export async function saveShortcut(shortcut?: Shortcuts | { $state?: Shortcuts }) {
  let toSave: Shortcuts | undefined

  if (!shortcut) {
    toSave = useShortcutStore().$state
  } else if ((shortcut as unknown as { $state?: Shortcuts }).$state) {
    toSave = (shortcut as unknown as { $state?: Shortcuts }).$state
  } else {
    toSave = shortcut as Shortcuts
  }

  const rawItems = toRaw(toSave as Shortcuts).items

  await shortcutStorage.setValue({ items: rawItems })
}

export const useShortcutStore = defineStore('shortcut', {
  state: () => {
    return structuredClone(defaultShortcuts)
  },
})
