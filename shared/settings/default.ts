import { BgType, ClockWeight, DrawerDirection, SortMode } from '@/shared/enums'

import { type CURRENT_CONFIG_INTERFACE, CURRENT_CONFIG_VERSION } from './current'

export const defaultSettings = {
  theme: {
    primaryColor: '#f5b800',
    colorfulMode: false,
    monetColor: false,
    idleHide: false
  },
  clock: {
    enabled: true,
    colorfulNum: true,
    newStyle: true,
    isMeridiem: false,
    showMeridiem: true,
    showDate: true,
    showLunar: true,
    showSeconds: false,
    size: 50,
    weight: ClockWeight.Black,
    calcWeight: ClockWeight.Medium,
    meridiemFollowSize: false,
    shadow: true,
    blink: true,
    invertColor: {
      light: false,
      night: false
    }
  },
  search: {
    enabled: true,
    expandAlways: false,
    showIconAlways: false,
    suggestionAPI: 'bing',
    engine: 'bing',
    openInNewTab: false,
    recordHistory: true,
    shadow: true,
    border: false,
    placeholder: '',
    launchAnimation: false
  },
  background: {
    bgType: BgType.Bing,
    vignette: false,
    blur: 3,
    mask: {
      opacity: 0,
      light: '#f2f3f5',
      night: '#000'
    },
    pauseOnBlur: false,
    fastAnimation: false,
    local: {
      id: '',
      url: '',
      mediaType: undefined
    },
    localDark: {
      id: '',
      url: '',
      mediaType: undefined
    },
    bing: {
      id: '',
      url: '',
      updateDate: ''
    },
    online: {
      url: '',
      enableCache: false,
      cacheDuration: 1, // 默认缓存1小时
      noExpires: false
    }
  },
  shortcut: {
    enabled: true,
    enableTopSites: true,
    enableShadow: true,
    enableBorder: false,
    enablePaging: true,
    showOnSearchFocus: false,
    rows: 2,
    columns: 5,
    itemMarginH: 5,
    itemMarginV: 20,
    showShortcutTitle: true,
    showPinnedIcon: true,
    iconSize: 50,
    iconRatio: 0.5,
    iconMarginBottom: 8,
    titleExtraWidth: 35,
    whiteTextInLightMode: true,
    marginTop: 50,
    openInNewTab: false
  },
  dock: {
    enabled: false,
    enableTopSites: true,
    showOnSearchFocus: true,
    gap: 5,
    limitCount: false,
    maxCount: 10,
    iconSize: 40,
    iconRatio: 0.7,
    openInNewTab: false,
    launchpad: {
      enabled: false,
      enableTopSites: true,
      openInNewTab: false
    }
  },
  sync: {
    enabled: false
  },
  yiyan: {
    enabled: true,
    alwaysShow: true,
    provider: 'jinrishici',
    enableShadow: true,
    invertColor: {
      light: false,
      night: false
    }
  },
  perf: {
    enableBookmarkTransparent: true,
    enableBookmarkBlur: true,
    enableDialogTransparent: true,
    enableDialogBlur: true,
    enableDialogAnimation: true,
    enableFocusScale: true,
    enableFocusBlur: true,
    enableShortcutTransparent: true,
    enableShortcutBlur: true,
    enableSearchBarTransparent: true,
    enableSearchBarBlur: true,
    enableYiyanTransparent: true,
    enableYiyanBlur: true,
    enableYiyanRipple: true,
    enableSettingsBtnBlur: true,
    enableSettingsBtnTransparent: true,
    enableBgSwitchAnim: true,
    enableDockScale: true
  },
  bookmark: {
    direction: DrawerDirection.rtl,
    rightClickToOpen: true,
    showBtn: true,
    defaultSortMode: SortMode.Original
  },
  hideMajorChangelog: true,
  readChangeLog: false,
  pluginVersion: '',
  version: CURRENT_CONFIG_VERSION
} satisfies CURRENT_CONFIG_INTERFACE
