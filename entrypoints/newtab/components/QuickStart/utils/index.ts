import type { TopSites } from 'webextension-polyfill'

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
