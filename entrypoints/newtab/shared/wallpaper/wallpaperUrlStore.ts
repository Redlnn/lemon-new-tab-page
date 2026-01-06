import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { isMediaFile, isVideoFile } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import {
  useBingWallpaperStorge,
  useDarkWallpaperStorge,
  useWallpaperStorge,
  wallpaperUrlCache
} from '.'

export const useWallpaperUrlStore = defineStore('wallpaperUrl', () => {
  const settings = useSettingsStore()

  const lightUrl = ref('')
  const darkUrl = ref('')
  const bingUrl = ref('')

  const getBackgroundKey = (type: 'light' | 'dark' | 'bing' = 'bing') => {
    if (type === 'light') return 'localBackground'
    if (type === 'dark') return 'localDarkBackground'
    if (type === 'bing') return 'bingBackground'
    return 'bingBackground'
  }

  const getTargetRef = (type: 'light' | 'dark' | 'bing') => {
    if (type === 'light') return lightUrl
    if (type === 'dark') return darkUrl
    return bingUrl
  }

  const updateRef = (type: 'light' | 'dark' | 'bing', url: string) => {
    const targetRef = getTargetRef(type)
    const oldUrl = targetRef.value
    if (oldUrl && oldUrl.startsWith('blob:') && oldUrl !== url) {
      URL.revokeObjectURL(oldUrl)
    }
    targetRef.value = url
  }

  const getUrl = async (type: 'light' | 'dark' | 'bing'): Promise<Ref<string>> => {
    const background = settings[getBackgroundKey(type)]
    const targetRef = getTargetRef(type)

    if (!background.id) {
      if (type === 'dark') {
        return getUrl('light')
      }
      updateRef(type, '')
      return targetRef
    }

    const cachedUrl = (await wallpaperUrlCache.getValue())[type]
    if (cachedUrl) {
      try {
        const res = await fetch(cachedUrl)
        if (res.ok) {
          updateRef(type, cachedUrl)
          return targetRef
        }
      } catch {}
      await wallpaperUrlCache.setValue({
        ...(await wallpaperUrlCache.getValue()),
        [type]: ''
      })
    }

    let file: Blob | null = null

    if (type === 'light') {
      file = await useWallpaperStorge.getItem<Blob>(background.id)
    } else if (type === 'dark') {
      file = await useDarkWallpaperStorge.getItem<Blob>(background.id)
    } else if (type === 'bing') {
      file = await useBingWallpaperStorge.getItem<Blob>(background.id)
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
      updateRef(type, url)
      return targetRef
    }

    updateRef(type, '')
    return targetRef
  }

  watch(
    () => settings.localBackground.id,
    () => getUrl('light'),
    { immediate: true }
  )
  watch(
    () => settings.localDarkBackground.id,
    () => getUrl('dark'),
    { immediate: true }
  )
  watch(
    () => settings.bingBackground.id,
    () => getUrl('bing'),
    { immediate: true }
  )

  const setUrl = async (type: 'light' | 'dark' | 'bing', url: string) => {
    const cache = await wallpaperUrlCache.getValue()
    // 如果有旧的 URL，先撤销
    const cachedUrl = cache[type]
    if (cachedUrl && cachedUrl.startsWith('blob:') && cachedUrl !== url) {
      URL.revokeObjectURL(cachedUrl)
    }

    await wallpaperUrlCache.setValue({ ...cache, [type]: url })
    updateRef(type, url)
  }

  const clearUrl = async (type: 'light' | 'dark' | 'bing') => {
    const cache = await wallpaperUrlCache.getValue()
    // 如果有旧的 URL，先撤销
    const cachedUrl = cache[type]
    if (cachedUrl && cachedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cachedUrl)
    }

    await wallpaperUrlCache.setValue({ ...cache, [type]: '' })
    updateRef(type, '')
  }

  return { getUrl, setUrl, clearUrl, lightUrl, darkUrl, bingUrl }
})
