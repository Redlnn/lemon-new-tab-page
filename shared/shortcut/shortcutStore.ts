import { defineStore } from 'pinia'

import { defaultShortcuts, type Shortcuts, shortcutStorage } from './shortcutStorage'

export async function initShortcut() {
  const shortcut = await shortcutStorage.getValue()
  const shortcutStore = useShortcutStore()
  shortcutStore.$patch(shortcut)
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
