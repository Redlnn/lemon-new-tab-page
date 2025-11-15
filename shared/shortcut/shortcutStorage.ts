import { storage } from '#imports'

export interface Shortcut {
  items: { url: string; title: string; favicon?: string }[]
}

export const defaultShortcut: Shortcut = { items: [] }

export const shortcutStorage = storage.defineItem<Shortcut>('local:bookmark', {
  fallback: structuredClone(defaultShortcut)
})
