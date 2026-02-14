import { storage } from '#imports'

import { type CURRENT_CONFIG_INTERFACE, CURRENT_CONFIG_VERSION } from './current'
import { defaultSettings } from './default'
import { migrateFromVer7To8 } from './migrate'
import type { SettingsInterfaceVer7, SettingsInterfaceVer8 } from './types'

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
    // 不再提供对第6版及以前的迁移支持，遇到 <=6 的数据应由初始化逻辑提示用户清除数据
    8: createMigration<SettingsInterfaceVer7, SettingsInterfaceVer8>(7, migrateFromVer7To8)
  }
})
