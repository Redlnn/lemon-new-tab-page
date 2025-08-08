import { CURRENT_CONFIG_VERSION, type CURRENT_CONFIG_INTERFACE } from './current'
import { BgType } from './types'

export const defaultSettings: CURRENT_CONFIG_INTERFACE = {
  primaryColor: '#FFBB00',
  time: {
    isMeridiem: false,
    showMeridiem: true,
    showDate: true,
    showLunar: true,
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
    selectedSearchEngine: 2,
    searchInNewTab: false,
    recordSearchHistory: true,
    enableShadow: true,
    enableYiyan: true
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
  pluginVersion: '',
  version: CURRENT_CONFIG_VERSION
}
