export { BgType } from './types'
export { migrateFromVer1To3, migrateFromVer2To3 } from './migrate'
export type { OldSettingsInterface, SettingsInterfaceVer2, SettingsInterfaceVer3 } from './types'

import { BgType, type SettingsInterfaceVer3 } from './types'

export const CURRENT_CONFIG_VERSION = 3

export const defaultSettings: SettingsInterfaceVer3 = {
  primaryColor: '#FFBB00',
  time: {
    isMeridiem: false,
    showMeridiem: true,
    showDate: true,
    showLunar: true,
    enableShadow: true,
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
    bgMaskPpacity: 0,
    maskColor: '#000',
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
  quickStart: {
    enabled: true,
    enableTopSites: true,
    enableShadow: true,
    rows: 2,
    columns: 5,
    itemMarginH: 10,
    itemMarginV: 10,
    showQuickStartTitle: true,
    showPinnedIcon: true,
    showQuickStartContainerBg: false,
    iconSize: 50,
    whiteTextInLightMode: true
  },
  pluginVersion: '',
  version: 3
}
