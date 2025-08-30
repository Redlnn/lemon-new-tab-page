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
    selectedSearchSuggestionAPI: keyof typeof import('@newtab/scripts/api/search').searchSuggestAPIs
    selectedSearchEngine: keyof typeof import('../migrate/searchEnginesMap').searchEnginesMap
    searchInNewTab: boolean
    recordSearchHistory: boolean
    enableShadow: boolean
    enableYiyan: boolean
  }
  background: {
    bgType: BgType
    enableVignetting: boolean
    blurIntensity: number
    bgMaskPpacity: number
    maskColor: string
    onlineUrl: string
  }
  localBackground: {
    id: string
    url: string
  }
  bingBackground: {
    id: string
    url: string
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
    iconSize: number
    whiteTextInLightMode: boolean
    marginTop: number
  }
  pluginVersion: string
  version: 3
}
