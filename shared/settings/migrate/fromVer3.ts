import type { SettingsInterfaceVer3, SettingsInterfaceVer4 } from '../types'

export function migrateFromVer3To4(oldSettings: SettingsInterfaceVer3): SettingsInterfaceVer4 {
  return {
    primaryColor: oldSettings.primaryColor,
    time: {
      isMeridiem: oldSettings.time.isMeridiem,
      showMeridiem: oldSettings.time.showMeridiem,
      showDate: oldSettings.time.showDate,
      showLunar: oldSettings.time.showLunar,
      enableShadow: oldSettings.time.enableShadow,
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
      enableShadow: oldSettings.search.enableShadow,
      enableYiyan: oldSettings.search.enableYiyan
    },
    background: {
      bgType: oldSettings.background.bgType,
      enableVignetting: oldSettings.background.enableVignetting,
      blurIntensity: oldSettings.background.blurIntensity,
      bgMaskOpacity: oldSettings.background.bgMaskPpacity,
      maskColor: oldSettings.background.maskColor,
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
      enabled: oldSettings.quickStart.enabled,
      enableTopSites: oldSettings.quickStart.enableTopSites,
      enableShadow: oldSettings.quickStart.enableShadow,
      rows: oldSettings.quickStart.rows,
      columns: oldSettings.quickStart.columns,
      itemMarginH: oldSettings.quickStart.itemMarginH,
      itemMarginV: oldSettings.quickStart.itemMarginV,
      showShortcutTitle: oldSettings.quickStart.showQuickStartTitle,
      showPinnedIcon: oldSettings.quickStart.showPinnedIcon,
      showShortcutContainerBg: oldSettings.quickStart.showQuickStartContainerBg,
      iconSize: oldSettings.quickStart.iconSize,
      whiteTextInLightMode: oldSettings.quickStart.whiteTextInLightMode,
      marginTop: oldSettings.quickStart.marginTop
    },
    pluginVersion: oldSettings.pluginVersion,
    version: 4
  }
}
