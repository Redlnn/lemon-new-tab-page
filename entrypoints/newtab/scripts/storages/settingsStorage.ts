import { storage } from 'wxt/storage'
import {
  migrateFromVer2To3,
  type SettingsInterfaceVer2,
  type SettingsInterfaceVer3,
  CURRENT_CONFIG_VERSION,
  defaultSettings
} from '../settings'

export const settingsStorage = storage.defineItem<SettingsInterfaceVer3>('local:settings', {
  fallback: defaultSettings,
  version: CURRENT_CONFIG_VERSION,
  migrations: {
    // Ran when migrating from v1 to v2
    2: async () => {
      // 早期没版本管理跳过了2
    },
    // Ran when migrating from v2 to v3
    3: async (settings: SettingsInterfaceVer2): Promise<SettingsInterfaceVer3> => {
      console.log(settings)
      if (settings.version === 2) {
        return migrateFromVer2To3(settings)
      } else if (settings.version === 3) {
        return settings as unknown as SettingsInterfaceVer3
      }
      throw new Error('Invalid settings version')
    }
  }
})
