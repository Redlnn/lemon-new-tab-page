import { storage } from 'wxt/storage'

export interface Bookmark {
  items: { url: string; title: string; favicon?: string }[]
}

export const defaultBookmark: Bookmark = { items: [] }

export const bookmarkStorage = storage.defineItem<Bookmark>('local:bookmark', {
  fallback: defaultBookmark
})
