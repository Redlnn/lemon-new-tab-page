import { defineStore } from 'pinia'

import { defaultShortcut, type Shortcut, shortcutStorage } from './shortcutStorage'

export async function initShortcut() {
  const shortcut = await shortcutStorage.getValue()
  const shortcutStore = useShortcutStore()
  shortcutStore.$patch(shortcut)
}

export async function saveShortcut(shortcut?: Shortcut | { $state?: Shortcut }) {
  let toSave: Shortcut | undefined

  if (!shortcut) {
    toSave = useShortcutStore().$state
  } else if ((shortcut as unknown as { $state?: Shortcut }).$state) {
    toSave = (shortcut as unknown as { $state?: Shortcut }).$state
  } else {
    toSave = shortcut as Shortcut
  }

  const rawItems = toRaw(toSave as Shortcut).items

  await shortcutStorage.setValue({ items: rawItems })
}

export const useShortcutStore = defineStore('shortcut', {
  state: () => {
    return structuredClone(defaultShortcut)
  }
})
