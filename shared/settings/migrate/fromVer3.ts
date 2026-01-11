import { defaultSettings, type SettingsInterfaceVer3, type SettingsInterfaceVer4 } from '..'

export function migrateFromVer3To4(oldSettings: SettingsInterfaceVer3): SettingsInterfaceVer4 {
  return {
    primaryColor: oldSettings.primaryColor,
    time: structuredClone(oldSettings.time),
    search: { ...oldSettings.search },
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
      url: defaultSettings.background.local.url!
    },
    bingBackground: {
      id: oldSettings.bingBackground.id,
      url: defaultSettings.background.bing.url!,
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
