import type { SettingsInterfaceVer2, SettingsInterfaceVer3 } from '..'
import { defaultSettings } from '..'

export function migrateFromVer2To3(oldSettings: SettingsInterfaceVer2): SettingsInterfaceVer3 {
  return {
    primaryColor: oldSettings.primaryColor,
    time: structuredClone(oldSettings.time),
    search: { ...oldSettings.search },
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
      url: defaultSettings.background.local.url!
    },
    bingBackground: {
      id: oldSettings.bingBackground.bgId,
      url: defaultSettings.background.bing.url!,
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
