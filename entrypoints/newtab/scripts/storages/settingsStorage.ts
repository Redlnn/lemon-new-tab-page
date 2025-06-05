import { storage } from '#imports'
import {
  migrateFromVer2To4,
  migrateFromVer3To4,
  type SettingsInterfaceVer2,
  type SettingsInterfaceVer3,
  type SettingsInterfaceVer4,
  CURRENT_CONFIG_VERSION,
  defaultSettings
} from '../settings'

export const settingsStorage = storage.defineItem<SettingsInterfaceVer4>('local:settings', {
  fallback: defaultSettings,
  version: CURRENT_CONFIG_VERSION,
  migrations: {
    // Ran when migrating from v1 to v2
    2: async () => {
      // 早期没版本管理跳过了2
    },
    // Ran when migrating from v2 to v3
    3: async (settings: SettingsInterfaceVer2): Promise<SettingsInterfaceVer4> => {
      if (settings.version === 2) {
        return migrateFromVer2To4(settings)
      } else if (settings.version === 3) {
        return settings as unknown as SettingsInterfaceVer4
      }
      throw new Error('Invalid settings version')
    },
    4: async (settings: SettingsInterfaceVer3): Promise<SettingsInterfaceVer4> => {
      if (settings.version === 3) {
        return migrateFromVer3To4(settings)
      }
      throw new Error('Invalid settings version')
    }
  }
})
