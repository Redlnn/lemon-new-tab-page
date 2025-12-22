import type { CURRENT_CONFIG_INTERFACE, OldSettingsInterface } from '..'
import { defaultSettings } from '..'
import { searchEnginesMap } from './searchEnginesMap'

export function migrateFromVer1(oldSettings: OldSettingsInterface): CURRENT_CONFIG_INTERFACE {
  return {
    primaryColor: oldSettings.primaryColor,
    colorfulMode: defaultSettings.colorfulMode,
    monetColor: defaultSettings.monetColor,
    time: {
      enabled: defaultSettings.time.enabled,
      isMeridiem: oldSettings.isMeridiem,
      showMeridiem: oldSettings.showMeridiem,
      showDate: defaultSettings.time.showDate,
      showLunar: defaultSettings.time.showLunar,
      showSeconds: defaultSettings.time.showSeconds,
      small: defaultSettings.time.small,
      enableShadow: defaultSettings.time.enableShadow,
      blinkingColon: defaultSettings.time.blinkingColon,
      invertColor: {
        light: defaultSettings.time.invertColor.light,
        night: defaultSettings.time.invertColor.night
      }
    },
    search: {
      enabled: defaultSettings.search.enabled,
      alwaysExpandSearchBar: defaultSettings.search.alwaysExpandSearchBar,
      alwaysShowIcon: defaultSettings.search.alwaysShowIcon,
      selectedSearchSuggestionAPI: oldSettings.selectedSearchSuggestionAPI,
      selectedSearchEngine: searchEnginesMap[oldSettings.selectedSearchEngine],
      searchInNewTab: oldSettings.searchInNewTab,
      recordSearchHistory: oldSettings.recordSearchHistory,
      enableShadow: defaultSettings.search.enableShadow,
      placeholder: defaultSettings.search.placeholder,
      launchAnim: defaultSettings.search.launchAnim
    },
    background: {
      bgType: oldSettings.bgType,
      enableVignetting: oldSettings.bgDarkCorners,
      blurIntensity: oldSettings.bgBlur,
      bgMaskOpacity: oldSettings.bgMaskPpacity,
      lightMaskColor: defaultSettings.background.lightMaskColor,
      nightMaskColor: defaultSettings.background.nightMaskColor,
      onlineUrl: defaultSettings.background.onlineUrl,
      pauseWhenBlur: defaultSettings.background.pauseWhenBlur,
      fasterBgAnim: defaultSettings.background.fasterBgAnim
    },
    localBackground: {
      id: oldSettings.bgId,
      url: defaultSettings.localBackground.url
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
      disablePaging: defaultSettings.shortcut.disablePaging,
      showOnSearchFocus: defaultSettings.shortcut.showOnSearchFocus,
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
      iconRatio: defaultSettings.shortcut.iconRatio,
      whiteTextInLightMode: defaultSettings.shortcut.whiteTextInLightMode,
      marginTop: defaultSettings.shortcut.marginTop,
      openInNewTab: defaultSettings.shortcut.openInNewTab
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
      disableBookmarkTransparent: defaultSettings.perf.disableBookmarkTransparent,
      disableBookmarkBlur: defaultSettings.perf.disableBookmarkBlur,
      disableDialogTransparent: defaultSettings.perf.disableDialogTransparent,
      disableDialogBlur: defaultSettings.perf.disableDialogBlur,
      disableDialogAnimation: defaultSettings.perf.disableDialogAnimation,
      disableFocusScale: defaultSettings.perf.disableFocusScale,
      disableFocusBlur: defaultSettings.perf.disableFocusBlur,
      disableShortcutTransparent: defaultSettings.perf.disableShortcutTransparent,
      disableShortcutBlur: defaultSettings.perf.disableShortcutBlur,
      disableSearchBarTransparent: defaultSettings.perf.disableSearchBarTransparent,
      disableSearchBarBlur: defaultSettings.perf.disableSearchBarBlur,
      disableYiyanTransparent: defaultSettings.perf.disableYiyanTransparent,
      disableYiyanBlur: defaultSettings.perf.disableYiyanBlur,
      disableSettingsBtnBlur: defaultSettings.perf.disableSettingsBtnBlur,
      disableSettingsBtnTransparent: defaultSettings.perf.disableSettingsBtnTransparent,
      disableBgSwitchAnim: defaultSettings.perf.disableBgSwitchAnim
    },
    bookmarkSidebar: {
      direction: defaultSettings.bookmarkSidebar.direction,
      rightClickToOpen: defaultSettings.bookmarkSidebar.rightClickToOpen,
      hideBtn: defaultSettings.bookmarkSidebar.hideBtn
    },
    hideMajorChangelog: defaultSettings.hideMajorChangelog,
    readChangeLog: defaultSettings.readChangeLog,
    pluginVersion: oldSettings.version,
    version: 7
  }
}
