import type { BgType } from './enum'

export interface SettingsInterfaceVer3 {
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
    rows: number
    columns: number
    itemMarginH: number
    itemMarginV: number
    showQuickStartTitle: boolean
    showPinnedIcon: boolean
    showQuickStartContainerBg: boolean
    itemSize: number
    whiteTextInLightMode: boolean
  }
  pluginVersion: string
  version: number
}
