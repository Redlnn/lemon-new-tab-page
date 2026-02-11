import localForage from 'localforage'

import { COMMON_CONFIG } from './wallpaperStorge'

interface CachedImage {
  url: string
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
 * @param cacheDuration 缓存时长（小时）
 * @returns 缓存的Blob，如果已过期或不存在则返回null
 */
export async function getCachedOnlineWallpaper(
  url: string,
  cacheDuration: number
): Promise<Blob | null> {
  try {
    const cached = await useOnlineWallpaperCacheStore.getItem<CachedImage>(url)
    if (!cached) return null

    const now = Date.now()
    const cacheAge = (now - cached.timestamp) / (1000 * 60 * 60) // 转换为小时

    // 检查缓存是否过期
    if (cacheAge > cacheDuration) {
      await useOnlineWallpaperCacheStore.removeItem(url)
      return null
    }

    return cached.blob
  } catch {
    return null
  }
}

/**
 * 缓存在线壁纸
 * @param url 壁纸URL
 * @param blob 图片Blob数据
 */
export async function cacheOnlineWallpaper(url: string, blob: Blob): Promise<void> {
  try {
    const cacheData: CachedImage = {
      url,
      blob,
      timestamp: Date.now()
    }
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
