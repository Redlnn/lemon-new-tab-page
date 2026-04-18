import type { TopSites } from 'webextension-polyfill'

import { shortcutStorage, useShortcutStore, type Shortcut } from '@/shared/shortcut'

import { blockedTopSitesStorage } from '@newtab/shared/storages/topSitesStorage'

import { invalidateTopSitesCache } from '../utils/topSites'

/**
 * 快捷方式数据层：
 * - 维护 topSites / shortcuts / mounted / topSitesNeedsReload 状态
 * - 监听 storage 变化并自动调用外部传入的 refresh 回调
 * 注：allItems 合并逻辑由调用方自行定义（不同组件对数据的组织方式不同）
 */
export function useShortcutData(refreshDebounced: () => void) {
  const shortcutStore = useShortcutStore()

  const topSites = shallowRef<TopSites.MostVisitedURL[]>([])
  const shortcuts = shallowRef<Shortcut[]>([])
  const mounted = ref(false)
  const topSitesNeedsReload = ref(true)

  // 云同步或 popup 添加书签导致 storage 变动时刷新
  shortcutStorage.watch(async (newValue) => {
    if (newValue) {
      shortcutStore.$patch(newValue)
    }
    refreshDebounced()
  })

  blockedTopSitesStorage.watch(() => {
    topSitesNeedsReload.value = true
    invalidateTopSitesCache()
    refreshDebounced()
  })

  return {
    topSites,
    shortcuts,
    mounted,
    topSitesNeedsReload,
  }
}
