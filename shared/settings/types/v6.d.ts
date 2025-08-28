import type { BgType } from './enum'

export interface SettingsInterfaceVer6 {
  primaryColor: string
  time: {
    isMeridiem: boolean
    showMeridiem: boolean
    showDate: boolean
    showLunar: boolean
    enableShadow: boolean
    blinkingColon: boolean
    invertColor: {
      light: boolean
      night: boolean
    }
  }
  search: {
    autoFocus: boolean
    selectedSearchSuggestionAPI: keyof typeof import('@newtab/scripts/api/search').searchSuggestAPIs
    selectedSearchEngine: TupleIndices<typeof import('@newtab/scripts/api/search').searchEngines>
    searchInNewTab: boolean
    recordSearchHistory: boolean
    enableShadow: boolean
  }
  background: {
    bgType: BgType
    enableVignetting: boolean
    blurIntensity: number
    bgMaskOpacity: number
    lightMaskColor: string
    nightMaskColor: string
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
  yiyan: {
    enabled: boolean
    alwaysShow: boolean
    provider: keyof typeof import('@/shared/yiyan').yiyanProviders
  }
  pluginVersion: string
  version: 6
}
