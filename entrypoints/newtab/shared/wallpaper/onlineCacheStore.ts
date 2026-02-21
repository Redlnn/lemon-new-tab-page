import localForage from 'localforage'

import { COMMON_CONFIG } from './wallpaperStorge'

interface CachedImage {
  blob: Blob
  timestamp: number
}

export const useOnlineWallpaperCacheStore = localForage.createInstance({
  ...COMMON_CONFIG,
  storeName: 'onlineWallpaperCache'
})

/**
 * 获取缓存的在线壁纸
 * @param url 壁纸URL
 * @returns 缓存的Blob，如果已过期或不存在则返回null
 */
export async function getCachedOnlineWallpaper(url: string): Promise<CachedImage | null> {
  try {
    return await useOnlineWallpaperCacheStore.getItem<CachedImage>(url)
  } catch {
    return null
  }
}

/**
 * 缓存在线壁纸
 * @param url 壁纸URL
 * @param blob 图片Blob数据
 */
export async function cacheOnlineWallpaper(url: string, cacheData: CachedImage): Promise<void> {
  try {
    await useOnlineWallpaperCacheStore.setItem(url, cacheData)
  } catch {
    // 缓存失败时静默处理
  }
}

/**
 * 清除所有在线壁纸缓存
 */
export async function clearAllOnlineWallpaperCache(url?: string): Promise<void> {
  try {
    if (url) URL.revokeObjectURL(url)
    await useOnlineWallpaperCacheStore.clear()
  } catch {
    // 清除失败时静默处理
  }
}
