import type { CURRENT_CONFIG_INTERFACE, OldSettingsInterface } from '..'
import { defaultSettings } from '..'
import { searchEnginesMap, toNewBgType } from './map'

export function migrateFromVer1(oldSettings: OldSettingsInterface): CURRENT_CONFIG_INTERFACE {
  return {
    theme: {
      primaryColor: oldSettings.primaryColor,
      colorfulMode: defaultSettings.theme.colorfulMode,
      monetColor: defaultSettings.theme.monetColor
    },
    clock: {
      enabled: defaultSettings.clock.enabled,
      isMeridiem: oldSettings.isMeridiem,
      showMeridiem: oldSettings.showMeridiem,
      showDate: defaultSettings.clock.showDate,
      showLunar: defaultSettings.clock.showLunar,
      showSeconds: defaultSettings.clock.showSeconds,
      size: defaultSettings.clock.size,
      weight: defaultSettings.clock.weight,
      meridiemFollowSize: defaultSettings.clock.meridiemFollowSize,
      shadow: defaultSettings.clock.shadow,
      blink: defaultSettings.clock.blink,
      invertColor: { ...defaultSettings.clock.invertColor }
    },
    search: {
      enabled: defaultSettings.search.enabled,
      expandAlways: defaultSettings.search.expandAlways,
      showIconAlways: defaultSettings.search.showIconAlways,
      suggestionAPI: oldSettings.selectedSearchSuggestionAPI,
      engine: searchEnginesMap[oldSettings.selectedSearchEngine],
      openInNewTab: oldSettings.searchInNewTab,
      recordHistory: oldSettings.recordSearchHistory,
      shadow: defaultSettings.search.shadow,
      placeholder: defaultSettings.search.placeholder,
      launchAnimation: defaultSettings.search.launchAnimation
    },
    background: {
      bgType: toNewBgType(oldSettings.bgType),
      vignette: oldSettings.bgDarkCorners,
      blur: oldSettings.bgBlur,
      mask: {
        opacity: oldSettings.bgMaskPpacity,
        light: defaultSettings.background.mask.light,
        night: defaultSettings.background.mask.night
      },
      pauseOnBlur: defaultSettings.background.pauseOnBlur,
      fastAnimation: defaultSettings.background.fastAnimation,
      local: {
        id: oldSettings.bgId,
        url: defaultSettings.background.local.url
      },
      localDark: { ...defaultSettings.background.localDark },
      bing: {
        id: oldSettings.bingWallpaper.bgId,
        url: oldSettings.bingWallpaper.url,
        updateDate: oldSettings.bingWallpaper.updateDate
      },
      online: { ...defaultSettings.background.online }
    },
    shortcut: {
      enabled: oldSettings.enabled,
      enableTopSites: oldSettings.enableTopSites,
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
      iconSize: defaultSettings.shortcut.iconSize,
      iconRatio: defaultSettings.shortcut.iconRatio,
      iconMarginBottom: defaultSettings.shortcut.iconMarginBottom,
      titleExtraWidth: defaultSettings.shortcut.titleExtraWidth,
      whiteTextInLightMode: defaultSettings.shortcut.whiteTextInLightMode,
      marginTop: defaultSettings.shortcut.marginTop,
      openInNewTab: defaultSettings.shortcut.openInNewTab
    },
    sync: { ...defaultSettings.sync },
    yiyan: {
      enabled: oldSettings.enableYiyan,
      alwaysShow: defaultSettings.yiyan.alwaysShow,
      provider: defaultSettings.yiyan.provider,
      enableShadow: defaultSettings.yiyan.enableShadow,
      invertColor: { ...defaultSettings.yiyan.invertColor }
    },
    perf: { ...defaultSettings.perf },
    bookmark: { ...defaultSettings.bookmark },
    hideMajorChangelog: defaultSettings.hideMajorChangelog,
    readChangeLog: defaultSettings.readChangeLog,
    pluginVersion: oldSettings.version,
    version: 8
  }
}
