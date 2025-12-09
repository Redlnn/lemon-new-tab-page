import type { TopSites } from 'webextension-polyfill'

import { useSettingsStore } from '@/shared/settings'

import { getTopSites } from '@newtab/components/Shortcut/utils/topSites'

interface UseTopSitesMergeOptions {
  shortcuts: { url: string }[]
  columns?: number
  maxRows?: number
  force?: boolean
}

export async function useTopSitesMerge(
  options: UseTopSitesMergeOptions
): Promise<TopSites.MostVisitedURL[]> {
  const settings = useSettingsStore()

  if (!settings.shortcut.enableTopSites) {
    // 不启用最常访问：不追加，final = 书签 + 添加按钮
    return []
  }

  // 计算容量（优先使用 columns + maxRows，上限为列*行 - 1，预留“添加按钮”）
  let remain = Infinity
  const { columns, maxRows } = options
  const hasCapacityInfo = typeof columns === 'number' && typeof maxRows === 'number'
  if (hasCapacityInfo) {
    const capacity = Math.max(0, columns * maxRows - 1)
    remain = Math.max(0, capacity - options.shortcuts.length)
    if (remain === 0) {
      return []
    }
  }

  // 如果 getTopSites() 返回 undefined，则默认空数组
  const topSites = (await getTopSites(options.force)) ?? []

  // 去重：移除与书签重复的 URL
  const shortcutUrlsSet = new Set(options.shortcuts.map((b) => b.url))
  const dedup = topSites.filter((site) => !shortcutUrlsSet.has(site.url))

  if (remain === Infinity) {
    return dedup
  }

  return dedup.slice(0, remain)
}
