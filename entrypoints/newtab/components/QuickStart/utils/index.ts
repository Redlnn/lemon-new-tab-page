import type { Bookmark } from '@/entrypoints/newtab/scripts/storages/bookmarkStorage'
import type { Store } from 'pinia'
import _ from 'lodash'
import type { Ref } from 'vue'
import type { TopSites } from 'wxt/browser'

export function getQuickStartItemWidth(QSNum: number, cols: number) {
  if (QSNum < cols) {
    return 100 / QSNum + '%'
  } else {
    return 100 / cols + '%'
  }
}

export function getQSSize(
  bookmarks: { url: string; title: string; favicon?: string }[],
  topSites: TopSites.MostVisitedURL[]
) {
  return bookmarks.length + topSites.length + 1
}
