import type { BgType } from './enum'

export interface SettingsInterfaceVer5 {
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
    enableVignetting: boolean
    blurIntensity: number
    bgMaskOpacity: number
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
  shortcut: {
    enabled: boolean
    enableTopSites: boolean
    enableShadow: boolean
    rows: number
    columns: number
    itemMarginH: number
    itemMarginV: number
    showShortcutTitle: boolean
    showPinnedIcon: boolean
    showShortcutContainerBg: boolean
    iconSize: number
    whiteTextInLightMode: boolean
    marginTop: number
  }
  sync: {
    enabled: boolean
  }
  pluginVersion: string
  version: number
}
