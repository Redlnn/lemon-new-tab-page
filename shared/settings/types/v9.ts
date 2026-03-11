import type { BgType, ClockWeight, DrawerDirection, SortMode } from '@/shared/enums'

import type { YiyanProviderKey } from '@newtab/shared/yiyan'

import type { bingBackground, localBackground } from './type'

export interface SettingsInterfaceVer9 {
  // 主题相关
  theme: {
    primaryColor: string
    colorfulMode: boolean
    monetColor: boolean
    idleHide: boolean
  }

  // 时钟/时间显示
  clock: {
    enabled: boolean
    colorfulNum: boolean
    newStyle: boolean
    isMeridiem: boolean
    showMeridiem: boolean
    showDate: boolean
    showLunar: boolean
    showSeconds: boolean
    size: number
    weight: ClockWeight
    calcWeight: ClockWeight
    meridiemFollowSize: boolean
    shadow: boolean
    blink: boolean
    invertColor: {
      light: boolean
      night: boolean
    }
  }

  // 搜索相关
  search: {
    enabled: boolean
    expandAlways: boolean
    showIconAlways: boolean
    suggestionAPI: keyof typeof import('@newtab/shared/search').searchSuggestAPIs
    engine: string
    openInNewTab: boolean
    recordHistory: boolean
    shadow: boolean
    border: boolean
    placeholder: string
    launchAnimation: boolean
  }

  // 背景设置
  background: {
    bgType: BgType
    vignette: boolean
    blur: number
    mask: {
      opacity: number
      light: string
      night: string
    }
    pauseOnBlur: boolean // 视频壁纸
    fastAnimation: boolean
    local: localBackground
    localDark: localBackground
    bing: bingBackground
    online: {
      url: string
      enableCache: boolean
      cacheDuration: number // 缓存时长，单位为小时
      noExpires: boolean
    }
  }

  // 快速访问
  shortcut: {
    enabled: boolean
    enableTopSites: boolean
    enableShadow: boolean
    enableBorder: boolean
    enablePaging: boolean
    showOnSearchFocus: boolean
    rows: number
    columns: number
    itemMarginH: number
    itemMarginV: number
    showShortcutTitle: boolean
    showPinnedIcon: boolean
    iconSize: number
    iconRatio: number
    iconMarginBottom: number
    titleExtraWidth: number
    whiteTextInLightMode: boolean
    marginTop: number
    openInNewTab: boolean
  }

  // Dock
  dock: {
    enabled: boolean
    enableTopSites: boolean
    showOnSearchFocus: boolean
    gap: number
    limitCount: boolean
    maxCount: number
    iconSize: number
    iconRatio: number
    openInNewTab: boolean
    launchpad: {
      enabled: boolean
      enableTopSites: boolean
      openInNewTab: boolean
    }
  }

  // 同步
  sync: {
    enabled: boolean
  }

  // 一言
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

  // 性能相关
  perf: {
    enableBookmarkTransparent: boolean
    enableBookmarkBlur: boolean
    enableDialogTransparent: boolean
    enableDialogBlur: boolean
    enableDialogAnimation: boolean
    enableFocusScale: boolean
    enableFocusBlur: boolean
    enableShortcutTransparent: boolean
    enableShortcutBlur: boolean
    enableSearchBarTransparent: boolean
    enableSearchBarBlur: boolean
    enableYiyanTransparent: boolean
    enableYiyanBlur: boolean
    enableYiyanRipple: boolean
    enableSettingsBtnBlur: boolean
    enableSettingsBtnTransparent: boolean
    enableBgSwitchAnim: boolean
    enableDockScale: boolean
  }

  // 书签侧边栏
  bookmark: {
    direction: DrawerDirection
    rightClickToOpen: boolean
    showBtn: boolean
    defaultSortMode: SortMode
  }

  hideMajorChangelog: boolean
  readChangeLog: boolean
  pluginVersion: string
  version: 9
}
