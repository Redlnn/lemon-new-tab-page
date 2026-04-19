import { storage } from '#imports'

export interface Shortcut {
  url: string
  title: string
  favicon?: string
}

export interface Shortcuts {
  items: Shortcut[]
}

export const defaultShortcuts: Shortcuts = { items: [] }

export const shortcutStorage = storage.defineItem<Shortcuts>('local:bookmark', {
  fallback: structuredClone(defaultShortcuts),
})
