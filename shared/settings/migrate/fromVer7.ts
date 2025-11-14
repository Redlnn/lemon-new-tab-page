import type { SettingsInterfaceVer7, SettingsInterfaceVer8 } from '../types'

export function migrateFromVer7To8(oldSettings: SettingsInterfaceVer7): SettingsInterfaceVer8 {
  return {
    ...oldSettings,
    bookmarkMenu: {
      enable: true
    },
    version: 8
  }
}
