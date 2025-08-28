import { defaultSettings } from '../default'
import type { SettingsInterfaceVer5, SettingsInterfaceVer6 } from '../types'

export function migrateFromVer5To6(oldSettings: SettingsInterfaceVer5): SettingsInterfaceVer6 {
  return {
    primaryColor: oldSettings.primaryColor,
    time: {
      isMeridiem: oldSettings.time.isMeridiem,
      showMeridiem: oldSettings.time.showMeridiem,
      showDate: oldSettings.time.showDate,
      showLunar: oldSettings.time.showLunar,
      enableShadow: oldSettings.time.enableShadow,
      blinkingColon: defaultSettings.time.blinkingColon,
      invertColor: {
        light: oldSettings.time.invertColor.light,
        night: oldSettings.time.invertColor.night
      }
    },
    search: {
      autoFocus: oldSettings.search.autoFocus,
      selectedSearchSuggestionAPI: oldSettings.search.selectedSearchSuggestionAPI,
      selectedSearchEngine: oldSettings.search.selectedSearchEngine,
      searchInNewTab: oldSettings.search.searchInNewTab,
      recordSearchHistory: oldSettings.search.recordSearchHistory,
      enableShadow: oldSettings.search.enableShadow
    },
    background: {
      bgType: oldSettings.background.bgType,
      enableVignetting: oldSettings.background.enableVignetting,
      blurIntensity: oldSettings.background.blurIntensity,
      bgMaskOpacity: oldSettings.background.bgMaskOpacity,
      lightMaskColor: oldSettings.background.lightMaskColor,
      nightMaskColor: oldSettings.background.nightMaskColor,
      onlineUrl: oldSettings.background.onlineUrl
    },
    localBackground: {
      id: oldSettings.localBackground.id,
      url: oldSettings.localBackground.url
    },
    bingBackground: {
      id: oldSettings.bingBackground.id,
      url: oldSettings.bingBackground.url,
      updateDate: oldSettings.bingBackground.updateDate
    },
    shortcut: {
      enabled: oldSettings.shortcut.enabled,
      enableTopSites: oldSettings.shortcut.enableTopSites,
      enableShadow: oldSettings.shortcut.enableShadow,
      rows: oldSettings.shortcut.rows,
      columns: oldSettings.shortcut.columns,
      itemMarginH: oldSettings.shortcut.itemMarginH,
      itemMarginV: oldSettings.shortcut.itemMarginV,
      showShortcutTitle: oldSettings.shortcut.showShortcutTitle,
      showPinnedIcon: oldSettings.shortcut.showPinnedIcon,
      showShortcutContainerBg: oldSettings.shortcut.showShortcutContainerBg,
      iconSize: oldSettings.shortcut.iconSize,
      whiteTextInLightMode: oldSettings.shortcut.whiteTextInLightMode,
      marginTop: oldSettings.shortcut.marginTop
    },
    sync: {
      enabled: oldSettings.sync.enabled
    },
    yiyan: {
      enabled: oldSettings.search.enableYiyan,
      alwaysShow: defaultSettings.yiyan.alwaysShow,
      provider: defaultSettings.yiyan.provider
    },
    pluginVersion: oldSettings.pluginVersion,
    version: 6
  }
}
