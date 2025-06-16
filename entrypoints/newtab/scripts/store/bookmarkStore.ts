import { defineStore } from 'pinia'

import { type Bookmark, bookmarkStorage, defaultBookmark } from '../storages/bookmarkStorage'

export async function initBookmark() {
  const bookmark = await bookmarkStorage.getValue()
  const bookmarkStore = useBookmarkStore()
  bookmarkStore.$patch(bookmark)
}

export async function saveBookmark(bookmark: Bookmark) {
  await bookmarkStorage.setValue({ items: Object.values(bookmark.items) })
}

export const useBookmarkStore = defineStore('bookmark', {
  state: () => {
    return structuredClone(defaultBookmark)
  }
})
