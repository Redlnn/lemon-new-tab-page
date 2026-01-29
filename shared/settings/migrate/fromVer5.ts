import type { SettingsInterfaceVer5, SettingsInterfaceVer6 } from '..'
import { defaultSettings } from '..'
import { searchEnginesMap } from './map'

export function migrateFromVer5To6(oldSettings: SettingsInterfaceVer5): SettingsInterfaceVer6 {
  const engine =
    searchEnginesMap[oldSettings.search.selectedSearchEngine as keyof typeof searchEnginesMap] ??
    defaultSettings.search.engine

  return {
    primaryColor: oldSettings.primaryColor,
    time: {
      isMeridiem: oldSettings.time.isMeridiem,
      showMeridiem: oldSettings.time.showMeridiem,
      showDate: oldSettings.time.showDate,
      showLunar: oldSettings.time.showLunar,
      small: true,
      enableShadow: oldSettings.time.enableShadow,
      blinkingColon: defaultSettings.clock.blink,
      invertColor: {
        light: oldSettings.time.invertColor.light,
        night: oldSettings.time.invertColor.night
      }
    },
    search: {
      autoFocus: oldSettings.search.autoFocus,
      selectedSearchSuggestionAPI: oldSettings.search.selectedSearchSuggestionAPI,
      selectedSearchEngine: engine,
      searchInNewTab: oldSettings.search.searchInNewTab,
      recordSearchHistory: oldSettings.search.recordSearchHistory,
      enableShadow: oldSettings.search.enableShadow,
      placeholder: defaultSettings.search.placeholder
    },
    background: { ...oldSettings.background },
    localBackground: {
      id: oldSettings.localBackground.id,
      url: defaultSettings.background.local.url!
    },
    localDarkBackground: {
      id: defaultSettings.background.localDark.id,
      url: defaultSettings.background.localDark.url!
    },
    bingBackground: {
      id: oldSettings.bingBackground.id,
      url: defaultSettings.background.bing.url!,
      updateDate: oldSettings.bingBackground.updateDate
    },
    shortcut: {
      enabled: oldSettings.shortcut.enabled,
      enableTopSites: oldSettings.shortcut.enableTopSites,
      enableAreaShadow: oldSettings.shortcut.enableShadow,
      enableShadow: defaultSettings.shortcut.enableShadow,
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
    sync: { ...oldSettings.sync },
    yiyan: {
      enabled: oldSettings.search.enableYiyan,
      alwaysShow: defaultSettings.yiyan.alwaysShow,
      provider: defaultSettings.yiyan.provider,
      enableShadow: defaultSettings.yiyan.enableShadow,
      invertColor: {
        light: defaultSettings.yiyan.invertColor.light,
        night: defaultSettings.yiyan.invertColor.night
      }
    },
    pluginVersion: oldSettings.pluginVersion,
    version: 6
  }
}
