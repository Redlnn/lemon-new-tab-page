import i18next from 'i18next'

import { type CURRENT_CONFIG_INTERFACE, CURRENT_CONFIG_VERSION } from './current'
import { BgType } from './types'

export const defaultSettings: CURRENT_CONFIG_INTERFACE = {
  primaryColor: '#F5B800',
  colorfulMode: false,
  time: {
    isMeridiem: false,
    showMeridiem: true,
    showDate: true,
    showLunar: true,
    small: false,
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
    placeholder: i18next.t('newtab:search.placeholder')
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
    marginTop: 50
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
    disableDialogTransparent: false,
    disableDialogBlur: false,
    disableDialogAnimation: false,
    disableFocusScale: false,
    disableFocusBlur: false,
    disableShortcutTransparent: false,
    disableShortcutBlur: false,
    disableSearchBarTransparent: false,
    disableSearchBarBlur: false,
    disableYiyanBlur: false,
    disableSettingsBtnBlur: false,
    disableSettingsBtnTransparent: false
  },
  hideMajorChangelog: true,
  readChangeLog: false,
  pluginVersion: '',
  version: CURRENT_CONFIG_VERSION
}
