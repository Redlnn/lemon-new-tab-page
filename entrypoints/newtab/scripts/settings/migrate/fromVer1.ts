import { defaultSettings } from '..'
import type { OldSettingsInterface, SettingsInterfaceVer3 } from '../types'

export function migrateFromVer1To3(oldSettings: OldSettingsInterface): SettingsInterfaceVer3 {
  return {
    primaryColor: oldSettings.primaryColor,
    time: {
      isMeridiem: oldSettings.isMeridiem,
      showMeridiem: oldSettings.showMeridiem,
      showDate: defaultSettings.time.showDate,
      showLunar: defaultSettings.time.showLunar,
      enableShadow: defaultSettings.time.enableShadow,
      invertColor: {
        light: defaultSettings.time.invertColor.light,
        night: defaultSettings.time.invertColor.night
      }
    },
    search: {
      autoFocus: defaultSettings.search.autoFocus,
      selectedSearchSuggestionAPI: oldSettings.selectedSearchSuggestionAPI,
      selectedSearchEngine: oldSettings.selectedSearchEngine,
      searchInNewTab: oldSettings.searchInNewTab,
      recordSearchHistory: oldSettings.recordSearchHistory,
      enableShadow: defaultSettings.search.enableShadow,
      enableYiyan: oldSettings.enableYiyan
    },
    background: {
      bgType: oldSettings.bgType,
      enableVignetting: oldSettings.bgDarkCorners,
      blurIntensity: oldSettings.bgBlur,
      bgMaskPpacity: oldSettings.bgMaskPpacity,
      maskColor: defaultSettings.background.maskColor,
      onlineUrl: defaultSettings.background.onlineUrl
    },
    localBackground: {
      id: oldSettings.bgId,
      url: oldSettings.bgUrl
    },
    bingBackground: {
      id: oldSettings.bingWallpaper.bgId,
      url: oldSettings.bingWallpaper.url,
      updateDate: oldSettings.bingWallpaper.updateDate
    },
    quickStart: {
      enabled: oldSettings.enabled,
      enableTopSites: oldSettings.enableTopSites,
      enableShadow: defaultSettings.quickStart.enableShadow,
      rows: oldSettings.quickStartRows,
      columns: oldSettings.quickStartColumns,
      itemMarginH: Math.round(
        (oldSettings.quickStartItemWidth - defaultSettings.quickStart.iconSize) / 2
      ),
      itemMarginV: Math.round(
        (oldSettings.quickStartItemWidth - defaultSettings.quickStart.iconSize) / 2
      ),
      showQuickStartTitle: oldSettings.showQuickStartTitle,
      showPinnedIcon: oldSettings.showPinnedIcon,
      showQuickStartContainerBg: defaultSettings.quickStart.showQuickStartContainerBg,
      iconSize: defaultSettings.quickStart.iconSize,
      whiteTextInLightMode: defaultSettings.quickStart.whiteTextInLightMode,
      marginTop: defaultSettings.quickStart.marginTop
    },
    pluginVersion: oldSettings.version,
    version: 2
  }
}
