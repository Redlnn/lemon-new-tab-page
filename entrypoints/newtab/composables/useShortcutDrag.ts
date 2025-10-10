import type { Ref } from 'vue'

import { useDraggable } from 'vue-draggable-plus'

import { saveBookmark, useBookmarkStore } from '@/shared/bookmark'

export function useShortcutDrag(
  containerRef: Ref<HTMLElement | undefined>,
  bookmarks: Ref<{ url: string; title: string; favicon?: string }[]>
) {
  const bookmarkStore = useBookmarkStore()
  useDraggable(containerRef, bookmarks, {
    animation: 150,
    handle: '.shortcut__item',
    onUpdate() {
      bookmarkStore.items = bookmarks.value
      saveBookmark(bookmarkStore.$state)
    }
  })
}
