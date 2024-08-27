import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import { LocalExtensionStorage } from '@/newtab/js/storage'
import { isImageFile } from '@/newtab/js/utils/img'
import { useWallpaperStore } from './wallpaperStore'

export enum BgType {
  None,
  Local,
  Bing
}

interface BingWallpaper {
  bgId: string
  url: string
  updateDate: string
}

interface Settings {
  primaryColor: string
  isMeridiem: boolean
  showMeridiem: boolean
  selectedSearchSuggestionAPI: string
  selectedSearchEngine: number
  searchInNewTab: boolean
  recordSearchHistory: boolean
  bgType: BgType
  bgDarkCorners: boolean
  bgBlur: number
  bgId: string
  bgUrl: string
  bgMaskPpacity: number
  enableQuickStart: boolean
  enableTopSites: boolean
  quickStartRows: number
  quickStartColumns: number
  quickStartItemWidth: number
  showQuickStartTitle: boolean
  showPinnedIcon: boolean
  enableYiyan: boolean
  bingWallpaper: BingWallpaper
  version: string
  [key: string]: any
}

const defaultSettings: Settings = {
  primaryColor: '#409eff',
  isMeridiem: true,
  showMeridiem: false,
  selectedSearchSuggestionAPI: '百度',
  selectedSearchEngine: 0,
  searchInNewTab: false,
  recordSearchHistory: true,
  bgType: BgType.Bing,
  bgDarkCorners: false,
  bgBlur: 3,
  bgId: '',
  bgUrl: '',
  bgMaskPpacity: 0,
  enableQuickStart: true,
  enableTopSites: true,
  quickStartRows: 2,
  quickStartColumns: 5,
  quickStartItemWidth: 110,
  showQuickStartTitle: true,
  showPinnedIcon: true,
  enableYiyan: true,
  bingWallpaper: {
    bgId: '',
    url: '',
    updateDate: ''
  },
  version: '0'
}

export async function readSettings() {
  const settings = await LocalExtensionStorage.getItem<Settings>('settings')
  if (settings) {
    const _o = Object.assign({}, defaultSettings, settings)
    await saveSettings(_o)
    return _o
  } else {
    await saveSettings(defaultSettings)
    return defaultSettings
  }
}

export async function saveSettings(settings: Settings) {
  await LocalExtensionStorage.setItem('settings', settings)
}

export const useSettingsStore = defineStore('opiton', {
  state: () => {
    return defaultSettings
  },
  actions: {
    async uploadBackgroundImage(imageFile: File) {
      // https://github.com/Devifish/light-tab

      const id = uuidv4()
      const url = URL.createObjectURL(imageFile)
      const url_old = this.bgUrl

      // 清除上次壁纸，ObjectURL可能导致内存溢出
      await useWallpaperStore.clear()
      if (url_old && url_old.startsWith('blob:')) {
        URL.revokeObjectURL(url_old)
      }

      // 保存图片到IndexedDB
      await useWallpaperStore.setItem<Blob>(id, imageFile)
      this.bgId = id
      this.bgUrl = url

      await saveSettings(this)
    },
    async reloadBackgroundImage() {
      const id = this.bgId
      const file = await useWallpaperStore.getItem<Blob>(id)

      // 校验图片数据是否可用，否则删除该数据
      if (file && isImageFile(file)) {
        const url = URL.createObjectURL(file)
        this.bgUrl = url
        await saveSettings(this)
      } else {
        this.bgId = ''
        this.bgUrl = ''
        await useWallpaperStore.removeItem(id)
      }
    }
  }
})
