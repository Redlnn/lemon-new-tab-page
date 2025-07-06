import { defaultSettings } from '..'
import type { OldSettingsInterface, SettingsInterfaceVer5 } from '../types'

export function migrateFromVer1To5(oldSettings: OldSettingsInterface): SettingsInterfaceVer5 {
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
      bgMaskOpacity: oldSettings.bgMaskPpacity,
      lightMaskColor: defaultSettings.background.lightMaskColor,
      nightMaskColor: defaultSettings.background.nightMaskColor,
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
    shortcut: {
      enabled: oldSettings.enabled,
      enableTopSites: oldSettings.enableTopSites,
      enableShadow: defaultSettings.shortcut.enableShadow,
      rows: oldSettings.quickStartRows,
      columns: oldSettings.quickStartColumns,
      itemMarginH: Math.round(
        (oldSettings.quickStartItemWidth - defaultSettings.shortcut.iconSize) / 2
      ),
      itemMarginV: Math.round(
        (oldSettings.quickStartItemWidth - defaultSettings.shortcut.iconSize) / 2
      ),
      showShortcutTitle: oldSettings.showQuickStartTitle,
      showPinnedIcon: oldSettings.showPinnedIcon,
      showShortcutContainerBg: defaultSettings.shortcut.showShortcutContainerBg,
      iconSize: defaultSettings.shortcut.iconSize,
      whiteTextInLightMode: defaultSettings.shortcut.whiteTextInLightMode,
      marginTop: defaultSettings.shortcut.marginTop
    },
    sync: {
      enabled: false
    },
    pluginVersion: oldSettings.version,
    version: 5
  }
}
