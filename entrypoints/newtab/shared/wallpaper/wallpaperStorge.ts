import { storage } from '#imports'

import { idbClear, idbDelete, idbGet, idbSet } from '@/shared/storage/idb'

/** 创建与 localforage API 兼容的 store 包装 */
function createWallpaperStore(storeName: 'wallpaper' | 'wallpaperBing' | 'wallpaperDark') {
  return {
    getItem: async <T = Blob>(_key: string): Promise<T | null> =>
      ((await idbGet(storeName, _key)) as T | undefined) ?? null,
    setItem: <T = Blob>(_key: string, value: T) => idbSet(storeName, _key, value as Blob),
    removeItem: (key: string) => idbDelete(storeName, key),
    clear: () => idbClear(storeName),
  }
}

export const useWallpaperStorge = createWallpaperStore('wallpaper')
export const useBingWallpaperStorge = createWallpaperStore('wallpaperBing')
export const useDarkWallpaperStorge = createWallpaperStore('wallpaperDark')

interface WallpaperUrlCache {
  light: string
  dark: string
  bing: string
}

const defaultWallpaperUrlCache: WallpaperUrlCache = {
  light: '',
  dark: '',
  bing: '',
} as const

export const wallpaperUrlCache = storage.defineItem<WallpaperUrlCache>('session:bingInfo', {
  fallback: defaultWallpaperUrlCache,
})
