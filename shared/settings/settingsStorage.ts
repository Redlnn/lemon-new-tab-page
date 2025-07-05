import { storage } from '#imports'
import type {
  SettingsInterfaceVer2,
  SettingsInterfaceVer3,
  SettingsInterfaceVer4,
  SettingsInterfaceVer5
} from './types'
import { migrateFromVer2To3, migrateFromVer3To4, migrateFromVer4To5 } from './migrate'
import { defaultSettings } from './default'
import { CURRENT_CONFIG_VERSION, type CURRENT_CONFTG_INTERFACE } from './current'

export const settingsStorage = storage.defineItem<CURRENT_CONFTG_INTERFACE>('local:settings', {
  fallback: structuredClone(defaultSettings),
  version: CURRENT_CONFIG_VERSION,
  migrations: {
    2: async (settings: SettingsInterfaceVer2): Promise<SettingsInterfaceVer3> => {
      if (settings.version > 2) {
        return settings as unknown as SettingsInterfaceVer3
      }
      console.log('Migrating config from version 2 to 3')
      return migrateFromVer2To3(settings)
    },
    3: async (settings: SettingsInterfaceVer3): Promise<SettingsInterfaceVer4> => {
      if (settings.version > 3) {
        return settings as unknown as SettingsInterfaceVer4
      }
      console.log('Migrating config from version 3 to 4')
      if (settings.version === 3) {
        return migrateFromVer3To4(settings)
      }
      throw new Error('Invalid config version')
    },
    4: async (settings: SettingsInterfaceVer4): Promise<SettingsInterfaceVer5> => {
      if (settings.version > 4) {
        return settings as unknown as SettingsInterfaceVer5
      }
      console.log('Migrating config from version 4 to 5')
      if (settings.version === 4) {
        return migrateFromVer4To5(settings)
      }
      throw new Error('Invalid config version')
    }
  }
})
