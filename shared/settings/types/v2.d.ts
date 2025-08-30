import type { BgType } from './enum'

export interface SettingsInterfaceVer2 {
  primaryColor: string
  time: {
    isMeridiem: boolean
    showMeridiem: boolean
    showDate: boolean
    showLunar: boolean
    enableShadow: boolean
    invertColor: {
      light: boolean
      night: boolean
    }
  }
  search: {
    autoFocus: boolean
    selectedSearchSuggestionAPI: keyof typeof import('@newtab/scripts/api/search').searchSuggestAPIs
    selectedSearchEngine: keyof typeof import('../migrate/searchEnginesMap').searchEnginesMap
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
  version: 2
}
