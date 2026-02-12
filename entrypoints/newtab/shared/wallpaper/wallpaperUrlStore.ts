import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { isMediaFile, isVideoFile } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'
import type { localBackground } from '@/shared/settings/types/type'

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

  const getTargetRef = (type: 'light' | 'dark' | 'bing') => {
    if (type === 'light') return lightUrl
    if (type === 'dark') return darkUrl
    return bingUrl
  }

  const updateRef = (type: 'light' | 'dark' | 'bing', url: string) => {
    const targetRef = getTargetRef(type)
    const oldUrl = targetRef.value
    if (oldUrl.startsWith('blob:') && oldUrl !== url) {
      URL.revokeObjectURL(oldUrl)
    }
    targetRef.value = url
  }

  const getUrl = async (type: 'light' | 'dark' | 'bing'): Promise<Ref<string>> => {
    let background: localBackground
    if (type === 'light') background = settings.background.local
    else if (type === 'dark') background = settings.background.localDark
    else background = settings.background.bing
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
        const bg = background as typeof settings.background.local
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
    () => settings.background.local.id,
    () => getUrl('light'),
    { immediate: true }
  )
  watch(
    () => settings.background.localDark.id,
    () => getUrl('dark'),
    { immediate: true }
  )
  watch(
    () => settings.background.bing.id,
    () => getUrl('bing'),
    { immediate: true }
  )

  const setUrl = async (type: 'light' | 'dark' | 'bing', url: string) => {
    const cache = await wallpaperUrlCache.getValue()
    // 如果有旧的 URL，先撤销
    const cachedUrl = cache[type]
    if (cachedUrl.startsWith('blob:') && cachedUrl !== url) {
      URL.revokeObjectURL(cachedUrl)
    }

    await wallpaperUrlCache.setValue({ ...cache, [type]: url })
    updateRef(type, url)
  }

  const clearUrl = async (type: 'light' | 'dark' | 'bing') => {
    const cache = await wallpaperUrlCache.getValue()
    // 如果有旧的 URL，先撤销
    const cachedUrl = cache[type]
    if (cachedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cachedUrl)
    }

    await wallpaperUrlCache.setValue({ ...cache, [type]: '' })
    updateRef(type, '')
  }

  return { getUrl, setUrl, clearUrl, lightUrl, darkUrl, bingUrl }
})
