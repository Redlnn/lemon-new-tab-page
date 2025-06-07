import { storage } from '#imports'
import {
  migrateFromVer2To3,
  migrateFromVer3To4,
  type SettingsInterfaceVer2,
  type SettingsInterfaceVer3,
  type SettingsInterfaceVer4,
  CURRENT_CONFIG_VERSION,
  type CURRENT_CONFTG_INTERFACE,
  defaultSettings
} from '../settings'

console.log('Initializing settings storage with version', CURRENT_CONFIG_VERSION)
export const settingsStorage = storage.defineItem<CURRENT_CONFTG_INTERFACE>('local:settings', {
  fallback: defaultSettings,
  version: CURRENT_CONFIG_VERSION,
  migrations: {
    2: async (settings: SettingsInterfaceVer2): Promise<SettingsInterfaceVer3> => {
      if (settings.version > 2) {
        return settings as unknown as SettingsInterfaceVer3
      }
      console.log('Migrating settings from version 2 to 3')
      return migrateFromVer2To3(settings)
    },
    3: async (settings: SettingsInterfaceVer3): Promise<SettingsInterfaceVer4> => {
      if (settings.version > 3) {
        return settings as unknown as SettingsInterfaceVer4
      }
      console.log('Migrating settings from version 3 to 4')
      if (settings.version === 3) {
        return migrateFromVer3To4(settings)
      }
      throw new Error('Invalid settings version')
    }
  }
})
