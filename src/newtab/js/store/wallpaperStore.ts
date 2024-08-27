import localForage from 'localforage'
import { name } from '@/manifest.json'

const COMMON_CONFIG: LocalForageOptions = {
  name: name,
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
