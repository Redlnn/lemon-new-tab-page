import { defaultSettings } from '../default'
import type { SettingsInterfaceVer6, SettingsInterfaceVer7 } from '../types'

export function migrateFromVer6To7(oldSettings: SettingsInterfaceVer6): SettingsInterfaceVer7 {
  return {
    primaryColor: oldSettings.primaryColor,
    colorfulMode: false,
    time: {
      isMeridiem: oldSettings.time.isMeridiem,
      showMeridiem: oldSettings.time.showMeridiem,
      showDate: oldSettings.time.showDate,
      showLunar: oldSettings.time.showLunar,
      small: oldSettings.time.small,
      enableShadow: oldSettings.time.enableShadow,
      blinkingColon: oldSettings.time.blinkingColon,
      invertColor: {
        light: oldSettings.time.invertColor.light,
        night: oldSettings.time.invertColor.night
      }
    },
    search: {
      alwaysExpandSearchBar: oldSettings.search.autoFocus,
      selectedSearchSuggestionAPI: oldSettings.search.selectedSearchSuggestionAPI,
      selectedSearchEngine: oldSettings.search.selectedSearchEngine,
      searchInNewTab: oldSettings.search.searchInNewTab,
      recordSearchHistory: oldSettings.search.recordSearchHistory,
      enableShadow: oldSettings.search.enableShadow,
      placeholder: oldSettings.search.placeholder
    },
    background: {
      bgType: oldSettings.background.bgType,
      enableVignetting: oldSettings.background.enableVignetting,
      blurIntensity: oldSettings.background.blurIntensity,
      bgMaskOpacity: oldSettings.background.bgMaskOpacity,
      lightMaskColor: oldSettings.background.lightMaskColor,
      nightMaskColor: oldSettings.background.nightMaskColor,
      onlineUrl: oldSettings.background.onlineUrl,
      pauseWhenBlur: defaultSettings.background.pauseWhenBlur
    },
    localBackground: {
      id: oldSettings.localBackground.id,
      url: oldSettings.localBackground.url
    },
    localDarkBackground: {
      id: oldSettings.localDarkBackground.id,
      url: oldSettings.localDarkBackground.url
    },
    bingBackground: {
      id: oldSettings.bingBackground.id,
      url: oldSettings.bingBackground.url,
      updateDate: oldSettings.bingBackground.updateDate
    },
    shortcut: {
      enabled: oldSettings.shortcut.enabled,
      enableTopSites: oldSettings.shortcut.enableTopSites,
      enableAreaShadow: oldSettings.shortcut.enableShadow,
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
    readedChangeLog: defaultSettings.readedChangeLog,
    pluginVersion: oldSettings.pluginVersion,
    version: 7
  }
}
