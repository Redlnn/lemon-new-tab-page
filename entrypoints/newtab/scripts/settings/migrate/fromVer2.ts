import { defaultSettings } from '..'
import type { SettingsInterfaceVer2, SettingsInterfaceVer3 } from '../types'

export function migrateFromVer2To3(oldSettings: SettingsInterfaceVer2): SettingsInterfaceVer3 {
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
      enableVignetting: oldSettings.background.bgDarkCorners,
      blurIntensity: oldSettings.background.bgBlur,
      bgMaskPpacity: oldSettings.background.bgMaskPpacity,
      maskColor: oldSettings.background.maskColor,
      onlineUrl: oldSettings.background.onlineUrl
    },
    localBackground: {
      id: oldSettings.localBackground.bgId,
      url: oldSettings.localBackground.bgUrl
    },
    bingBackground: {
      id: oldSettings.bingBackground.bgId,
      url: oldSettings.bingBackground.bgUrl,
      updateDate: oldSettings.bingBackground.updateDate
    },
    quickStart: {
      enabled: oldSettings.quickStart.enabled,
      enableTopSites: oldSettings.quickStart.enableTopSites,
      enableShadow: oldSettings.quickStart.enableShadow,
      rows: oldSettings.quickStart.quickStartRows,
      columns: oldSettings.quickStart.quickStartColumns,
      itemMarginH: Math.round(
        (oldSettings.quickStart.quickStartItemWidth - defaultSettings.shortcut.iconSize) / 2
      ),
      itemMarginV: Math.round(
        (oldSettings.quickStart.quickStartItemWidth - defaultSettings.shortcut.iconSize) / 2
      ),
      showQuickStartTitle: oldSettings.quickStart.showQuickStartTitle,
      showPinnedIcon: oldSettings.quickStart.showPinnedIcon,
      showQuickStartContainerBg: oldSettings.quickStart.showQuickStartContainerBg,
      iconSize: 50,
      whiteTextInLightMode: defaultSettings.shortcut.whiteTextInLightMode,
      marginTop: defaultSettings.shortcut.marginTop
    },
    pluginVersion: oldSettings.pluginVersion,
    version: 3
  }
}
