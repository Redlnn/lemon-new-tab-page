import type { TopSites } from 'webextension-polyfill'

import { useSettingsStore } from '@/shared/settings'

import { getTopSites } from '@newtab/components/Shortcut/utils/topSites'

export interface UseTopSitesMergeOptions {
  bookmarks: { url: string }[]
  columns?: number
  maxRows?: number
}

export async function useTopSitesMerge(
  options: UseTopSitesMergeOptions
): Promise<TopSites.MostVisitedURL[]> {
  const settings = useSettingsStore()

  if (!settings.shortcut.enableTopSites) {
    // 不启用最常访问：不追加，final = 书签 + 添加按钮
    return []
  }

  // 如果 getTopSites() 返回 undefined，则默认空数组
  const topSites = (await getTopSites()) ?? []

  // 去重：移除与书签重复的 URL
  const bookmarkUrlsSet = new Set(options.bookmarks.map((b) => b.url))
  const dedup = topSites.filter((site) => !bookmarkUrlsSet.has(site.url))

  // 计算容量（优先使用 columns + maxRows，上限为列*行 - 1，预留“添加按钮”）
  let capacity: number
  if (typeof options.columns === 'number' && typeof options.maxRows === 'number') {
    capacity = options.columns * options.maxRows - 1
  } else {
    // 无容量信息：退化为“全部可用”，由调用方决定是否二次截断
    capacity = Infinity
  }

  // remain < 0 表示书签已占满所有容量，此时不应再追加 TopSites
  const remain = Math.max(0, capacity - options.bookmarks.length)
  return remain > 0 ? dedup.slice(0, remain) : []
}
