import type { YiyanProviderKey } from '@/shared/yiyan'

import type { BgType } from './enum'

export interface SettingsInterfaceVer7 {
  primaryColor: string
  time: {
    isMeridiem: boolean
    showMeridiem: boolean
    showDate: boolean
    showLunar: boolean
    small: boolean
    enableShadow: boolean
    blinkingColon: boolean
    invertColor: {
      light: boolean
      night: boolean
    }
  }
  search: {
    alwaysExpandSearchBar: boolean
    selectedSearchSuggestionAPI: keyof typeof import('@newtab/scripts/api/search').searchSuggestAPIs
    selectedSearchEngine: keyof typeof import('@newtab/scripts/api/search').searchEngines
    searchInNewTab: boolean
    recordSearchHistory: boolean
    enableShadow: boolean
    placeholder: string
  }
  background: {
    bgType: BgType
    enableVignetting: boolean
    blurIntensity: number
    bgMaskOpacity: number
    lightMaskColor: string
    nightMaskColor: string
    onlineUrl: string
    pauseWhenBlur: boolean // 视频壁纸
  }
  localBackground: {
    id: string
    url: string
    // 可选的媒体类型: 'image' | 'video'，用于在渲染时选择 <img> 或 <video>
    mediaType?: 'image' | 'video'
  }
  localDarkBackground: {
    id: string
    url: string
    // 可选的媒体类型: 'image' | 'video'
    mediaType?: 'image' | 'video'
  }
  bingBackground: {
    id: string
    url: string
    updateDate: string
  }
  shortcut: {
    enabled: boolean
    enableTopSites: boolean
    enableAreaShadow: boolean
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
    provider: YiyanProviderKey
    enableShadow: boolean
    invertColor: {
      light: boolean
      night: boolean
    }
  }
  perf: {
    disableDialogTransparent: boolean
    disableDialogBlur: boolean
    disableDialogAnimation: boolean
    disableFocusScale: boolean
    disableFocusBlur: boolean
    disableShortcutTransparent: boolean
    disableShortcutBlur: boolean
    disableSearchBarTransparent: boolean
    disableSearchBarBlur: boolean
    disableYiyanBlur: boolean
    disableSettingsBtnBlur: boolean
    disableSettingsBtnTransparent: boolean
  }
  pluginVersion: string
  version: 7
}
