import type { SettingsInterfaceVer4, SettingsInterfaceVer5 } from '..'
import { defaultSettings } from '..'

export function migrateFromVer4To5(oldSettings: SettingsInterfaceVer4): SettingsInterfaceVer5 {
  return {
    primaryColor: oldSettings.primaryColor,
    time: structuredClone(oldSettings.time),
    search: { ...oldSettings.search },
    background: {
      bgType: oldSettings.background.bgType,
      enableVignetting: oldSettings.background.enableVignetting,
      blurIntensity: oldSettings.background.blurIntensity,
      bgMaskOpacity: oldSettings.background.bgMaskOpacity,
      lightMaskColor: oldSettings.background.maskColor,
      nightMaskColor: defaultSettings.background.mask.night,
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
    shortcut: { ...oldSettings.shortcut },
    sync: {
      enabled: defaultSettings.sync.enabled
    },
    pluginVersion: oldSettings.pluginVersion,
    version: 5
  }
}
