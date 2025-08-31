import { i18n } from '#imports'

import { CURRENT_CONFIG_VERSION, type CURRENT_CONFIG_INTERFACE } from './current'
import { BgType } from './types'

export const defaultSettings: CURRENT_CONFIG_INTERFACE = {
  primaryColor: '#FFBB00',
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
    autoFocus: false,
    selectedSearchSuggestionAPI: 'bing',
    selectedSearchEngine: 'bing',
    searchInNewTab: false,
    recordSearchHistory: true,
    enableShadow: true,
    placeholder: i18n.t('newtab.search.placeholder')
  },
  background: {
    bgType: BgType.Bing,
    enableVignetting: false,
    blurIntensity: 3,
    bgMaskOpacity: 0,
    lightMaskColor: '#f2f3f5',
    nightMaskColor: '#000',
    onlineUrl: ''
  },
  localBackground: {
    id: '',
    url: ''
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
  pluginVersion: '',
  version: CURRENT_CONFIG_VERSION
}
