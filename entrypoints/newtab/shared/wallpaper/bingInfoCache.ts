import { storage } from '#imports'

export interface BingWallpaperInfo {
  url: string
  copyright: string
  copyrightlink: string
  title: string
}

const defaultInfo: BingWallpaperInfo = {
  url: '',
  copyright: '',
  copyrightlink: '',
  title: ''
} as const

export const bingInfoCache = storage.defineItem<BingWallpaperInfo>('local:bingInfo', {
  fallback: defaultInfo
})
