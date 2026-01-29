import i18next from 'i18next'

import { BgType, ClockSize, ClockWeight, DrawerDirection, SortMode } from '@/shared/enums'

import { type CURRENT_CONFIG_INTERFACE, CURRENT_CONFIG_VERSION } from './current'

export const defaultSettings: CURRENT_CONFIG_INTERFACE = {
  theme: {
    primaryColor: '#f5b800',
    colorfulMode: false,
    monetColor: false
  },
  clock: {
    enabled: true,
    isMeridiem: false,
    showMeridiem: true,
    showDate: true,
    showLunar: true,
    showSeconds: false,
    size: ClockSize.Small,
    weight: ClockWeight.Normal,
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
    placeholder: i18next.t('newtab:search.placeholder'),
    launchAnimation: true
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
      url: ''
    }
  },
  shortcut: {
    enabled: true,
    enableTopSites: true,
    enableAreaShadow: true,
    enableShadow: true,
    disablePaging: false,
    showOnSearchFocus: false,
    rows: 2,
    columns: 5,
    itemMarginH: 5,
    itemMarginV: 20,
    showShortcutTitle: true,
    showPinnedIcon: true,
    showShortcutContainerBg: false,
    iconSize: 50,
    iconRatio: 0.5,
    iconMarginBottom: 8,
    titleExtraWidth: 35,
    whiteTextInLightMode: true,
    marginTop: 50,
    openInNewTab: false
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
    disableBookmarkTransparent: false,
    disableBookmarkBlur: false,
    disableDialogTransparent: false,
    disableDialogBlur: false,
    disableDialogAnimation: false,
    disableFocusScale: false,
    disableFocusBlur: false,
    disableShortcutTransparent: false,
    disableShortcutBlur: false,
    disableSearchBarTransparent: false,
    disableSearchBarBlur: false,
    disableYiyanTransparent: false,
    disableYiyanBlur: false,
    disableSettingsBtnBlur: false,
    disableSettingsBtnTransparent: false,
    disableBgSwitchAnim: false
  },
  bookmark: {
    direction: DrawerDirection.rtl,
    rightClickToOpen: true,
    hideBtn: false,
    defaultSortMode: SortMode.Original
  },
  hideMajorChangelog: true,
  readChangeLog: false,
  pluginVersion: '',
  version: CURRENT_CONFIG_VERSION
}
