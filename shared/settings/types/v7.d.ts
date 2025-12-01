import type { YiyanProviderKey } from '@newtab/shared/yiyan'

import type { BgType, DrawerDirection } from './enum'

export interface SettingsInterfaceVer7 {
  primaryColor: string
  colorfulMode: boolean
  monetColor: boolean
  time: {
    enabled: boolean
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
    enabled: boolean
    alwaysExpandSearchBar: boolean
    selectedSearchSuggestionAPI: keyof typeof import('@newtab/shared/search').searchSuggestAPIs
    selectedSearchEngine: string
    searchInNewTab: boolean
    recordSearchHistory: boolean
    enableShadow: boolean
    placeholder: string
    launchAnim: boolean
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
    /** @deprecated */
    url: string
    mediaType?: 'image' | 'video' // 可选的媒体类型: 'image' | 'video'，用于在渲染时选择 <img> 或 <video>
  }
  localDarkBackground: {
    id: string
    /** @deprecated */
    url: string
    mediaType?: 'image' | 'video'
  }
  bingBackground: {
    id: string
    /** @deprecated */
    url: string
    updateDate: string | number
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
    disableBookmarkTransparent: boolean
    disableBookmarkBlur: boolean
    disableDialogTransparent: boolean
    disableDialogBlur: boolean
    disableDialogAnimation: boolean
    disableFocusScale: boolean
    disableFocusBlur: boolean
    disableShortcutTransparent: boolean
    disableShortcutBlur: boolean
    disableSearchBarTransparent: boolean
    disableSearchBarBlur: boolean
    disableYiyanTransparent: boolean
    disableYiyanBlur: boolean
    disableSettingsBtnBlur: boolean
    disableSettingsBtnTransparent: boolean
  }
  bookmarkSidebar: {
    direction: DrawerDirection
    rightClickToOpen: boolean
    hideBtn: boolean
  }
  hideMajorChangelog: boolean
  readChangeLog: boolean
  pluginVersion: string
  version: 7
}
