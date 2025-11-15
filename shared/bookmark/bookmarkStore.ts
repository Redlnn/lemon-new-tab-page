import { defineStore } from 'pinia'

import { type Bookmark, bookmarkStorage, defaultBookmark } from './bookmarkStorage'

export async function initBookmark() {
  const bookmark = await bookmarkStorage.getValue()
  const bookmarkStore = useBookmarkStore()
  bookmarkStore.$patch(bookmark)
}

export async function saveBookmark(bookmark?: Bookmark | { $state?: Bookmark }) {
  let toSave: Bookmark | undefined

  if (!bookmark) {
    toSave = useBookmarkStore().$state
  } else if ((bookmark as unknown as { $state?: Bookmark }).$state) {
    toSave = (bookmark as unknown as { $state?: Bookmark }).$state
  } else {
    toSave = bookmark as Bookmark
  }

  const rawItems = (toSave as Bookmark).items.map((item) => toRaw(item))

  await bookmarkStorage.setValue({ items: rawItems })
}

export const useBookmarkStore = defineStore('bookmark', {
  state: () => {
    return structuredClone(defaultBookmark)
  }
})
