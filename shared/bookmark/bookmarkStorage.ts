import { storage } from '#imports'

export interface Bookmark {
  items: { url: string; title: string; favicon?: string }[]
}

export const defaultBookmark: Bookmark = { items: [] }

export const bookmarkStorage = storage.defineItem<Bookmark>('local:bookmark', {
  fallback: structuredClone(defaultBookmark)
})
