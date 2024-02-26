import { defineStore } from 'pinia'

import { LocalExtensionStorage } from '@/newtab/js/storage'

interface Bookmark {
  items: { [key: number]: { url: string; title: string } }
}

const defaultBookmark: Bookmark = { items: {} }

export async function readBookmark() {
  const bookmark = await LocalExtensionStorage.getItem<Bookmark>('bookmark')
  if (bookmark && bookmark.items) {
    return bookmark
  } else {
    return defaultBookmark
  }
}

export async function saveBookmark(bookmark: Bookmark) {
  await LocalExtensionStorage.setItem('bookmark', bookmark)
}

export const useBookmarkStore = defineStore('bookmark', {
  state: () => {
    return defaultBookmark
  }
})
