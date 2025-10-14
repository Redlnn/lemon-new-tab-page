import type { CURRENT_CONFIG_INTERFACE, OldSettingsInterface } from '..'
import { defaultSettings } from '..'
import { searchEnginesMap } from './searchEnginesMap'

export function migrateFromVer1(oldSettings: OldSettingsInterface): CURRENT_CONFIG_INTERFACE {
  return {
    primaryColor: oldSettings.primaryColor,
    colorfulMode: false,
    time: {
      isMeridiem: oldSettings.isMeridiem,
      showMeridiem: oldSettings.showMeridiem,
      showDate: defaultSettings.time.showDate,
      showLunar: defaultSettings.time.showLunar,
      small: defaultSettings.time.small,
      enableShadow: defaultSettings.time.enableShadow,
      blinkingColon: defaultSettings.time.blinkingColon,
      invertColor: {
        light: defaultSettings.time.invertColor.light,
        night: defaultSettings.time.invertColor.night
      }
    },
    search: {
      alwaysExpandSearchBar: defaultSettings.search.alwaysExpandSearchBar,
      selectedSearchSuggestionAPI: oldSettings.selectedSearchSuggestionAPI,
      selectedSearchEngine: searchEnginesMap[oldSettings.selectedSearchEngine],
      searchInNewTab: oldSettings.searchInNewTab,
      recordSearchHistory: oldSettings.recordSearchHistory,
      enableShadow: defaultSettings.search.enableShadow,
      placeholder: defaultSettings.search.placeholder
    },
    background: {
      bgType: oldSettings.bgType,
      enableVignetting: oldSettings.bgDarkCorners,
      blurIntensity: oldSettings.bgBlur,
      bgMaskOpacity: oldSettings.bgMaskPpacity,
      lightMaskColor: defaultSettings.background.lightMaskColor,
      nightMaskColor: defaultSettings.background.nightMaskColor,
      onlineUrl: defaultSettings.background.onlineUrl,
      pauseWhenBlur: defaultSettings.background.pauseWhenBlur
    },
    localBackground: {
      id: oldSettings.bgId,
      url: oldSettings.bgUrl
    },
    localDarkBackground: {
      id: defaultSettings.localDarkBackground.id,
      url: defaultSettings.localDarkBackground.url
    },
    bingBackground: {
      id: oldSettings.bingWallpaper.bgId,
      url: oldSettings.bingWallpaper.url,
      updateDate: oldSettings.bingWallpaper.updateDate
    },
    shortcut: {
      enabled: oldSettings.enabled,
      enableTopSites: oldSettings.enableTopSites,
      enableAreaShadow: defaultSettings.shortcut.enableAreaShadow,
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
    yiyan: {
      enabled: oldSettings.enableYiyan,
      alwaysShow: defaultSettings.yiyan.alwaysShow,
      provider: defaultSettings.yiyan.provider,
      enableShadow: defaultSettings.yiyan.enableShadow,
      invertColor: {
        light: defaultSettings.yiyan.invertColor.light,
        night: defaultSettings.yiyan.invertColor.night
      }
    },
    perf: {
      disableDialogTransparent: defaultSettings.perf.disableDialogTransparent,
      disableDialogBlur: defaultSettings.perf.disableDialogBlur,
      disableDialogAnimation: defaultSettings.perf.disableDialogAnimation,
      disableFocusScale: defaultSettings.perf.disableFocusScale,
      disableFocusBlur: defaultSettings.perf.disableFocusBlur,
      disableShortcutTransparent: defaultSettings.perf.disableShortcutTransparent,
      disableShortcutBlur: defaultSettings.perf.disableShortcutBlur,
      disableSearchBarTransparent: defaultSettings.perf.disableSearchBarTransparent,
      disableSearchBarBlur: defaultSettings.perf.disableSearchBarBlur,
      disableYiyanBlur: defaultSettings.perf.disableYiyanBlur,
      disableSettingsBtnBlur: defaultSettings.perf.disableSettingsBtnBlur,
      disableSettingsBtnTransparent: defaultSettings.perf.disableSettingsBtnTransparent
    },
    hideMajorChangelog: defaultSettings.hideMajorChangelog,
    readChangeLog: defaultSettings.readChangeLog,
    pluginVersion: oldSettings.version,
    version: 7
  }
}
