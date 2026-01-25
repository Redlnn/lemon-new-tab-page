import type { SettingsInterfaceVer6, SettingsInterfaceVer7 } from '..'
import { defaultSettings } from '..'

export function migrateFromVer6To7(oldSettings: SettingsInterfaceVer6): SettingsInterfaceVer7 {
  return {
    primaryColor: oldSettings.primaryColor,
    colorfulMode: defaultSettings.theme.colorfulMode,
    monetColor: defaultSettings.theme.monetColor,
    time: {
      enabled: defaultSettings.clock.enabled,
      isMeridiem: oldSettings.time.isMeridiem,
      showMeridiem: oldSettings.time.showMeridiem,
      showDate: oldSettings.time.showDate,
      showLunar: oldSettings.time.showLunar,
      showSeconds: defaultSettings.clock.showSeconds,
      small: oldSettings.time.small,
      enableShadow: oldSettings.time.enableShadow,
      blinkingColon: oldSettings.time.blinkingColon,
      invertColor: {
        light: oldSettings.time.invertColor.light,
        night: oldSettings.time.invertColor.night
      }
    },
    search: {
      enabled: defaultSettings.search.enabled,
      alwaysExpandSearchBar: oldSettings.search.autoFocus,
      alwaysShowIcon: defaultSettings.search.showIconAlways,
      selectedSearchSuggestionAPI: oldSettings.search.selectedSearchSuggestionAPI,
      selectedSearchEngine: oldSettings.search.selectedSearchEngine,
      searchInNewTab: oldSettings.search.searchInNewTab,
      recordSearchHistory: oldSettings.search.recordSearchHistory,
      enableShadow: oldSettings.search.enableShadow,
      placeholder: oldSettings.search.placeholder,
      launchAnim: defaultSettings.search.launchAnimation
    },
    background: {
      bgType: oldSettings.background.bgType,
      enableVignetting: oldSettings.background.enableVignetting,
      blurIntensity: oldSettings.background.blurIntensity,
      bgMaskOpacity: oldSettings.background.bgMaskOpacity,
      lightMaskColor: oldSettings.background.lightMaskColor,
      nightMaskColor: oldSettings.background.nightMaskColor,
      onlineUrl: oldSettings.background.onlineUrl,
      pauseWhenBlur: defaultSettings.background.pauseOnBlur,
      fasterBgAnim: defaultSettings.background.fastAnimation
    },
    localBackground: {
      id: oldSettings.localBackground.id,
      url: ''
    },
    localDarkBackground: {
      id: oldSettings.localDarkBackground.id,
      url: ''
    },
    bingBackground: {
      id: oldSettings.bingBackground.id,
      url: '',
      updateDate: oldSettings.bingBackground.updateDate
    },
    shortcut: {
      enabled: oldSettings.shortcut.enabled,
      enableTopSites: oldSettings.shortcut.enableTopSites,
      enableAreaShadow: oldSettings.shortcut.enableShadow,
      enableShadow: oldSettings.shortcut.enableShadow,
      disablePaging: defaultSettings.shortcut.disablePaging,
      showOnSearchFocus: defaultSettings.shortcut.showOnSearchFocus,
      rows: oldSettings.shortcut.rows,
      columns: oldSettings.shortcut.columns,
      itemMarginH: oldSettings.shortcut.itemMarginH,
      itemMarginV: oldSettings.shortcut.itemMarginV,
      showShortcutTitle: oldSettings.shortcut.showShortcutTitle,
      showPinnedIcon: oldSettings.shortcut.showPinnedIcon,
      showShortcutContainerBg: oldSettings.shortcut.showShortcutContainerBg,
      iconSize: oldSettings.shortcut.iconSize,
      iconRatio: defaultSettings.shortcut.iconRatio,
      whiteTextInLightMode: oldSettings.shortcut.whiteTextInLightMode,
      marginTop: oldSettings.shortcut.marginTop,
      openInNewTab: defaultSettings.shortcut.openInNewTab
    },
    sync: {
      enabled: oldSettings.sync.enabled
    },
    yiyan: {
      enabled: oldSettings.yiyan.enabled,
      alwaysShow: oldSettings.yiyan.alwaysShow,
      provider: oldSettings.yiyan.provider,
      enableShadow: oldSettings.yiyan.enableShadow,
      invertColor: {
        light: oldSettings.yiyan.invertColor.light,
        night: oldSettings.yiyan.invertColor.night
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
      direction: defaultSettings.bookmark.direction,
      rightClickToOpen: defaultSettings.bookmark.rightClickToOpen,
      hideBtn: defaultSettings.bookmark.hideBtn
    },
    hideMajorChangelog: defaultSettings.hideMajorChangelog,
    readChangeLog: defaultSettings.readChangeLog,
    pluginVersion: oldSettings.pluginVersion,
    version: 7
  }
}
