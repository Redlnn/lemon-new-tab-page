import localForage from 'localforage'

const COMMON_CONFIG: LocalForageOptions = {
  name: '柠檬起始页',
  driver: localForage.INDEXEDDB
}

export const useWallpaperStore = localForage.createInstance({
  ...COMMON_CONFIG,
  storeName: 'wallpaper'
})

export const useBingWallpaperStore = localForage.createInstance({
  ...COMMON_CONFIG,
  storeName: 'wallpaperBing'
})

export const useDarkWallpaperStore = localForage.createInstance({
  ...COMMON_CONFIG,
  storeName: 'wallpaperDark'
})
