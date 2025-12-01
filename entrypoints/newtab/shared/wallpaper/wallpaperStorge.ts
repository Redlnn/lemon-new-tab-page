import localForage from 'localforage'

import { storage } from '#imports'

const COMMON_CONFIG: LocalForageOptions = {
  name: '柠檬起始页',
  driver: localForage.INDEXEDDB
}

export const useWallpaperStorge = localForage.createInstance({
  ...COMMON_CONFIG,
  storeName: 'wallpaper'
})

export const useBingWallpaperStorge = localForage.createInstance({
  ...COMMON_CONFIG,
  storeName: 'wallpaperBing'
})

export const useDarkWallpaperStorge = localForage.createInstance({
  ...COMMON_CONFIG,
  storeName: 'wallpaperDark'
})

interface WallpaperUrlCache {
  light: string
  dark: string
  bing: string
}

const defaultWallpaperUrlCache: WallpaperUrlCache = {
  light: '',
  dark: '',
  bing: ''
} as const

export const wallpaperUrlCache = storage.defineItem<WallpaperUrlCache>('session:bingInfo', {
  fallback: defaultWallpaperUrlCache
})
