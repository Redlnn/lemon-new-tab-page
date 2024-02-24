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

interface Settings {
  primaryColor: string
  selectedSearchSuggestionAPI: string
  selectedSearchEngine: number
  searchInNewTab: boolean
  bgType: BgType
  bgDarkCorners: boolean
  bgBlur: number
  bgId: string
  bgUrl: string
  bgMaskPpacity: number
  enableTopSites: boolean
  topSitesRows: number
  topSitesColumns: number
  topSitesGap: number
  [key: string]: any
}

const defaultSettings: Settings = {
  primaryColor: '#409eff',
  selectedSearchSuggestionAPI: '百度',
  selectedSearchEngine: 0,
  searchInNewTab: false,
  bgType: BgType.Bing,
  bgDarkCorners: false,
  bgBlur: 3,
  bgId: '',
  bgUrl: '',
  bgMaskPpacity: 0,
  enableTopSites: true,
  topSitesRows: 2,
  topSitesColumns: 5,
  topSitesGap: 10
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
