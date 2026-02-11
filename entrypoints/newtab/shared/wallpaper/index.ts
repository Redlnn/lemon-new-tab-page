import { isVideoFile } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import { useDarkWallpaperStorge, useWallpaperStorge } from './wallpaperStorge'
import { useWallpaperUrlStore } from './wallpaperUrlStore'

export * from './wallpaperStorge'
export * from './wallpaperUrlStore'
export * from './bingWallpaper'
export * from './onlineCacheStore'

export async function uploadBackground(imageFile: File, isDarkMode = false) {
  const settings = useSettingsStore()

  const id = crypto.randomUUID()
  const url = URL.createObjectURL(imageFile)

  // 根据模式选择对应的 store & state
  const store = isDarkMode ? useDarkWallpaperStorge : useWallpaperStorge
  const backgroundState = isDarkMode ? settings.background.localDark : settings.background.local
  const prevUrl = backgroundState?.url || ''

  // 清除当前模式上次壁纸（IndexedDB）以节省空间。如果之前的 URL 是 blob:，撤销它
  await store.clear()
  if (prevUrl?.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(prevUrl)
    } catch {}
  }

  // 保存媒体文件到 IndexedDB 并更新状态，记录 mediaType
  const mediaType: 'image' | 'video' = isVideoFile(imageFile) ? 'video' : 'image'
  await store.setItem<Blob>(id, imageFile)
  if (isDarkMode) settings.background.localDark = { id, url, mediaType }
  else settings.background.local = { id, url, mediaType }

  const wallpaperStore = useWallpaperUrlStore()
  await wallpaperStore.setUrl(isDarkMode ? 'dark' : 'light', url)
}
