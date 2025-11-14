import { storage } from '#imports'

import { type CURRENT_CONFIG_INTERFACE, CURRENT_CONFIG_VERSION } from './current'
import { defaultSettings } from './default'
import {
  migrateFromVer2To3,
  migrateFromVer3To4,
  migrateFromVer4To5,
  migrateFromVer5To6,
  migrateFromVer6To7,
  migrateFromVer7To8
} from './migrate'
import type {
  SettingsInterfaceVer2,
  SettingsInterfaceVer3,
  SettingsInterfaceVer4,
  SettingsInterfaceVer5,
  SettingsInterfaceVer6,
  SettingsInterfaceVer7,
  SettingsInterfaceVer8
} from './types'

// 合并重复的迁移逻辑，通过辅助函数创建迁移函数
function createMigration<From, To>(
  fromVersion: number,
  migrationFn: (settings: From) => Promise<To> | To
) {
  return async (settings: From & { version: number }): Promise<To> => {
    if (settings.version > fromVersion) {
      return settings as unknown as To
    }
    console.log(`[Settings] Migrating config from version ${fromVersion} to ${fromVersion + 1}`)
    if (settings.version === fromVersion) {
      return await migrationFn(settings)
    }
    throw new Error('Invalid config version')
  }
}

export const settingsStorage = storage.defineItem<CURRENT_CONFIG_INTERFACE>('local:settings', {
  fallback: structuredClone(defaultSettings),
  version: CURRENT_CONFIG_VERSION,
  migrations: {
    2: createMigration<SettingsInterfaceVer2, SettingsInterfaceVer3>(2, migrateFromVer2To3),
    3: createMigration<SettingsInterfaceVer3, SettingsInterfaceVer4>(3, migrateFromVer3To4),
    4: createMigration<SettingsInterfaceVer4, SettingsInterfaceVer5>(4, migrateFromVer4To5),
    5: createMigration<SettingsInterfaceVer5, SettingsInterfaceVer6>(5, migrateFromVer5To6),
    6: createMigration<SettingsInterfaceVer6, SettingsInterfaceVer7>(6, migrateFromVer6To7),
    7: createMigration<SettingsInterfaceVer7, SettingsInterfaceVer8>(7, migrateFromVer7To8)
  }
})
