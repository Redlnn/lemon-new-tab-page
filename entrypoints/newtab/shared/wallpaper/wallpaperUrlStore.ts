import { defineStore } from 'pinia'

import { isMediaFile, isVideoFile } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import {
  useBingWallpaperStorge,
  useDarkWallpaperStorge,
  useWallpaperStorge,
  wallpaperUrlCache
} from '.'

export const useWallpaperUrlStore = defineStore('wallpaperUrl', () => {
  const getBackgroundKey = (type: 'light' | 'dark' | 'bing' = 'bing') => {
    if (type === 'light') return 'localBackground'
    if (type === 'dark') return 'localDarkBackground'
    if (type === 'bing') return 'bingBackground'
    return 'bingBackground'
  }

  const getUrl = async (type: 'light' | 'dark' | 'bing'): Promise<string> => {
    const settings = useSettingsStore()

    const background = settings[getBackgroundKey(type)]
    if (!background.id) return ''

    const cachedUrl = (await wallpaperUrlCache.getValue())[type]
    if (cachedUrl) {
      try {
        const res = await fetch(cachedUrl)
        if (res.ok) {
          return cachedUrl
        }
      } catch {}
      await wallpaperUrlCache.setValue({
        ...(await wallpaperUrlCache.getValue()),
        [type]: ''
      })
    }

    let file: Blob | null = null
    let id = ''

    if (type === 'light') {
      id = settings.localBackground.id
      if (id) file = await useWallpaperStorge.getItem<Blob>(id)
    } else if (type === 'dark') {
      id = settings.localDarkBackground.id
      if (id) file = await useDarkWallpaperStorge.getItem<Blob>(id)
    } else if (type === 'bing') {
      id = settings.bingBackground.id
      if (id) file = await useBingWallpaperStorge.getItem<Blob>(id)
    }

    if (file && isMediaFile(file)) {
      const url = URL.createObjectURL(file)

      if (type === 'dark' || type === 'light') {
        const bg = background as typeof settings.localBackground
        if (!bg.mediaType) {
          bg.mediaType = isVideoFile(file) ? 'video' : 'image'
        }
      }

      await wallpaperUrlCache.setValue({
        ...(await wallpaperUrlCache.getValue()),
        [type]: url
      })
      return url
    }

    return ''
  }

  const setUrl = async (type: 'light' | 'dark' | 'bing', url: string) => {
    // 如果有旧的 URL，先撤销
    const cachedUrl = (await wallpaperUrlCache.getValue())[type]
    if (cachedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cachedUrl)
    }

    await wallpaperUrlCache.setValue({
      ...(await wallpaperUrlCache.getValue()),
      [type]: url
    })
  }

  const clearUrl = async (type: 'light' | 'dark' | 'bing') => {
    // 如果有旧的 URL，先撤销
    const cachedUrl = (await wallpaperUrlCache.getValue())[type]
    if (cachedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cachedUrl)
    }

    await wallpaperUrlCache.setValue({
      ...(await wallpaperUrlCache.getValue()),
      [type]: ''
    })
  }

  return { getUrl, setUrl, clearUrl }
})
