import i18next from 'i18next'

import { type CURRENT_CONFIG_INTERFACE, CURRENT_CONFIG_VERSION } from './current'
import { BgType, DrawerDirection } from './types'

export const defaultSettings: CURRENT_CONFIG_INTERFACE = {
  primaryColor: '#f5b800',
  colorfulMode: false,
  monetColor: false,
  time: {
    enabled: true,
    isMeridiem: false,
    showMeridiem: true,
    showDate: true,
    showLunar: true,
    showSeconds: false,
    small: true,
    enableShadow: true,
    blinkingColon: true,
    invertColor: {
      light: false,
      night: false
    }
  },
  search: {
    enabled: true,
    alwaysExpandSearchBar: false,
    selectedSearchSuggestionAPI: 'bing',
    selectedSearchEngine: 'bing',
    searchInNewTab: false,
    recordSearchHistory: true,
    enableShadow: true,
    placeholder: i18next.t('newtab:search.placeholder'),
    launchAnim: true
  },
  background: {
    bgType: BgType.Bing,
    enableVignetting: false,
    blurIntensity: 3,
    bgMaskOpacity: 0,
    lightMaskColor: '#f2f3f5',
    nightMaskColor: '#000',
    onlineUrl: '',
    pauseWhenBlur: false
  },
  localBackground: {
    id: '',
    url: '',
    mediaType: undefined
  },
  localDarkBackground: {
    id: '',
    url: '',
    mediaType: undefined
  },
  bingBackground: {
    id: '',
    url: '',
    updateDate: ''
  },
  shortcut: {
    enabled: true,
    enableTopSites: true,
    enableAreaShadow: true,
    enableShadow: true,
    rows: 2,
    columns: 5,
    itemMarginH: 10,
    itemMarginV: 10,
    showShortcutTitle: true,
    showPinnedIcon: true,
    showShortcutContainerBg: false,
    iconSize: 50,
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
    disableSettingsBtnTransparent: false
  },
  bookmarkSidebar: {
    direction: DrawerDirection.rtl,
    rightClickToOpen: true,
    hideBtn: false
  },
  hideMajorChangelog: true,
  readChangeLog: false,
  pluginVersion: '',
  version: CURRENT_CONFIG_VERSION
}
