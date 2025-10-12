import { defineStore } from 'pinia'

import { type Bookmark, bookmarkStorage, defaultBookmark } from './bookmarkStorage'

export async function initBookmark() {
  const bookmark = await bookmarkStorage.getValue()
  const bookmarkStore = useBookmarkStore()
  bookmarkStore.$patch(bookmark)
}

export async function saveBookmark(bookmark: Bookmark) {
  const rawItems = bookmark.items.map((item) => toRaw(item))
  await bookmarkStorage.setValue({ items: rawItems })
}

export const useBookmarkStore = defineStore('bookmark', {
  state: () => {
    return structuredClone(defaultBookmark)
  }
})
