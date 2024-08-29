import _ from 'lodash'
import { defineStore } from 'pinia'
import { storage } from 'wxt/storage'

export interface Bookmark {
  items: { url: string; title: string }[]
}

export const defaultBookmark: Bookmark = { items: [] }

const bookmarkStorage = storage.defineItem<Bookmark>('local:bookmark', {
  fallback: defaultBookmark
})

export async function initBookmark() {
  const bookmark = await bookmarkStorage.getValue()
  const bookmarkStore = useBookmarkStore()
  bookmarkStore.$patch(bookmark)
}

export async function saveBookmark(bookmark: Bookmark) {
  console.log('saveBookmark', bookmark)
  await bookmarkStorage.setValue({ items: Object.values(bookmark.items) })
}

export const useBookmarkStore = defineStore('bookmark', {
  state: () => {
    return _.cloneDeep(defaultBookmark)
  }
})
