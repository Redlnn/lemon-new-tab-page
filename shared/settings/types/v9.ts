import type { BgType, ClockWeight, DrawerDirection, SortMode } from '@/shared/enums'

import type { YiyanProviderKey } from '@newtab/shared/yiyan'

import type { bingBackground, localBackground } from './type'

export interface SettingsSchemaV9 {
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
    hour12: boolean // 12 小时制

    // AM / PM
    meridiem: {
      show: boolean
      followSize: boolean
    }

    showDate: boolean
    showLunar: boolean
    showSeconds: boolean

    size: number
    weight: {
      time: ClockWeight
      date: ClockWeight
    }

    style: {
      shadow: boolean
      blink: boolean

      invertColor: {
        light: boolean
        night: boolean
      }
    }
  }

  // 搜索相关
  search: {
    enabled: boolean

    placeholder: string

    expandAlways: boolean
    showIconAlways: boolean

    suggestionAPI: keyof typeof import('@newtab/shared/search').searchSuggestAPIs
    engine: string

    openInNewTab: boolean
    recordHistory: boolean

    style: {
      shadow: boolean
      border: boolean
    }
  }

  // 背景设置
  background: {
    bgType: BgType

    vignette: boolean
    parallax: boolean

    blur: number

    mask: {
      enabled: boolean
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
      cache: {
        enabled: boolean
        duration: number // 缓存时长，单位为小时
        noExpires: boolean
      }
    }
  }

  // 快速访问
  shortcut: {
    enabled: boolean

    topSites: boolean
    topSitesIconCache: boolean
    pinnedIcon: boolean
    openInNewTab: boolean
    paging: boolean
    showOnSearchFocus: boolean

    iconSize: number
    iconRatio: number

    style: {
      shadow: boolean
      border: boolean
    }

    layout: {
      rows: number
      columns: number
    }

    marginTop: number
    spacing: {
      itemGapX: number
      itemGapY: number
      iconTitleGap: number
    }

    title: {
      show: boolean
      extraWidth: number
      whiteInLightMode: boolean
    }
  }

  // Dock
  dock: {
    enabled: boolean

    topSites: boolean
    showOnSearchFocus: boolean
    openInNewTab: boolean

    limitCount: boolean
    maxCount: number

    gap: number
    iconSize: number
    iconRatio: number

    launchpad: {
      enabled: boolean
      topSites: boolean
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

    style: {
      shadow: boolean
      invertColor: {
        light: boolean
        night: boolean
      }
    }
  }

  // 性能相关
  perf: {
    bgSwitchAnim: boolean
    dockScale: boolean
    bookmark: {
      transparent: boolean
      blur: boolean
    }
    dialog: {
      transparent: boolean
      blur: boolean
      animation: boolean
    }
    focus: {
      scale: boolean
      blur: boolean
    }
    shortcut: {
      transparent: boolean
      blur: boolean
    }
    searchBar: {
      transparent: boolean
      blur: boolean
      launchAnim: boolean
    }
    yiyan: {
      transparent: boolean
      blur: boolean
      ripple: boolean
    }
    actionBtns: {
      blur: boolean
      transparent: boolean
    }
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
