import { defineStore } from 'pinia'
import { toRaw } from 'vue'

import { type Bookmark, bookmarkStorage, defaultBookmark } from './bookmarkStorage'

export async function initBookmark() {
  const bookmark = await bookmarkStorage.getValue()
  const bookmarkStore = useBookmarkStore()
  bookmarkStore.$patch(bookmark)
}

export async function saveBookmark(bookmark: Bookmark) {
  const rawItems = toRaw(bookmark.items)
  await bookmarkStorage.setValue({ items: Object.values(rawItems) })
}

export const useBookmarkStore = defineStore('bookmark', {
  state: () => {
    return structuredClone(defaultBookmark)
  }
})
