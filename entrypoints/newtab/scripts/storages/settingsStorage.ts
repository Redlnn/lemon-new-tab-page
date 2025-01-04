import { storage } from 'wxt/storage'

export const CURRENT_CONFIG_VERSION = 2

export enum BgType {
  None,
  Local,
  Bing,
  Online
}

export interface OldSettingsInterface {
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
  enabled: boolean
  enableTopSites: boolean
  quickStartRows: number
  quickStartColumns: number
  quickStartItemWidth: number
  showQuickStartTitle: boolean
  showPinnedIcon: boolean
  enableYiyan: boolean
  bingWallpaper: {
    bgId: string
    url: string
    updateDate: string
  }
  version: string
}

export interface SettingsInterface {
  primaryColor: string
  time: {
    isMeridiem: boolean
    showMeridiem: boolean
    showDate: boolean
    showLunar: boolean
    enableShadow: boolean
  }
  search: {
    autoFocus: boolean
    selectedSearchSuggestionAPI: string
    selectedSearchEngine: number
    searchInNewTab: boolean
    recordSearchHistory: boolean
    enableShadow: boolean
    enableYiyan: boolean
  }
  background: {
    bgType: BgType
    bgDarkCorners: boolean
    bgBlur: number
    bgMaskPpacity: number
    maskColor: string
    onlineUrl: string
  }
  localBackground: {
    bgId: string
    bgUrl: string
  }
  bingBackground: {
    bgId: string
    bgUrl: string
    updateDate: string
  }
  quickStart: {
    enabled: boolean
    enableTopSites: boolean
    enableShadow: boolean
    quickStartRows: number
    quickStartColumns: number
    quickStartItemWidth: number
    showQuickStartTitle: boolean
    showPinnedIcon: boolean
    showQuickStartContainerBg: boolean
  }
  pluginVersion: string
  version: number
}

export const defaultSettings: SettingsInterface = {
  primaryColor: '#FFBB00',
  time: {
    isMeridiem: false,
    showMeridiem: true,
    showDate: true,
    showLunar: true,
    enableShadow: true
  },
  search: {
    autoFocus: false,
    selectedSearchSuggestionAPI: 'bing',
    selectedSearchEngine: 0,
    searchInNewTab: false,
    recordSearchHistory: true,
    enableShadow: true,
    enableYiyan: true
  },
  background: {
    bgType: BgType.Bing,
    bgDarkCorners: false,
    bgBlur: 3,
    bgMaskPpacity: 0,
    maskColor: '#000',
    onlineUrl: ''
  },
  localBackground: {
    bgId: '',
    bgUrl: ''
  },
  bingBackground: {
    bgId: '',
    bgUrl: '',
    updateDate: ''
  },
  quickStart: {
    enabled: true,
    enableTopSites: true,
    enableShadow: true,
    quickStartRows: 2,
    quickStartColumns: 5,
    quickStartItemWidth: 110,
    showQuickStartTitle: true,
    showPinnedIcon: true,
    showQuickStartContainerBg: true
  },
  pluginVersion: '',
  version: CURRENT_CONFIG_VERSION
}

export const settingsStorage = storage.defineItem<SettingsInterface>('local:settings', {
  fallback: defaultSettings
})
