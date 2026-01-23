import { defineStore, MutationType } from 'pinia'
import { useDebounceFn } from '@vueuse/core'

import { browser } from 'wxt/browser'

import type {
  CURRENT_CONFIG_INTERFACE,
  OldSettingsInterface,
  SettingsInterfaceVer2,
  SettingsInterfaceVer3,
  SettingsInterfaceVer4,
  SettingsInterfaceVer5,
  SettingsInterfaceVer6,
  SettingsInterfaceVer7
} from '../settings'
import {
  CURRENT_CONFIG_VERSION,
  defaultSettings,
  migrateFromVer1,
  migrateFromVer2To3,
  migrateFromVer3To4,
  migrateFromVer4To5,
  migrateFromVer5To6,
  migrateFromVer6To7,
  migrateFromVer7To8,
  useSettingsStore
} from '../settings'
import { defaultShortcut, saveShortcut, useShortcutStore } from '../shortcut'
import { localSyncDataStorage, syncDataStorage } from './syncDataStorage'
import type { SyncData, SyncMessage, SyncRequestMessage } from './types'

const debouncedSend = useDebounceFn(async (data: SyncData) => {
  try {
    await browser.runtime.sendMessage({
      type: 'SYNC_REQUEST',
      data
    } as SyncRequestMessage)
  } catch (err) {
    const error = err as Error
    console.error('Sync to cloud failed:', error)
  }
}, 2000)

async function handleSyncStorageUpdateMessage(message: SyncMessage) {
  const isSyncMessage = (msg: unknown) =>
    typeof msg === 'object' &&
    msg !== null &&
    'type' in msg &&
    typeof (msg as { type: unknown }).type === 'string' &&
    (msg as { type: string }).type === 'SYNC_UPDATE'

  if (isSyncMessage(message)) {
    const syncDataStore = useSyncDataStore()
    await syncDataStore.checkCloudSync()
  }
}

// 静默同步标志
// 防止初始化过程中触发 subChange
// 防止 applyCloudData 期间触发 subChange
let isProcessing = false

// 事件回调，用于通知 UI 层
export type SyncEventType = 'version-mismatch' | 'sync-error'
export type SyncEventPayloadMap = {
  'version-mismatch': { cloud: string; local: string }
  'sync-error': Error
}
export type SyncEventCallback = <T extends SyncEventType>(
  type: T,
  payload: SyncEventPayloadMap[T]
) => void
let syncEventCallback: SyncEventCallback | null = null
export function setSyncEventCallback(cb: SyncEventCallback | null) {
  syncEventCallback = cb
}

export async function initSyncSettings(localSettings: ReturnType<typeof useSettingsStore>) {
  isProcessing = true
  let cloudData: SyncData
  try {
    cloudData = await syncDataStorage.getValue()
    if (cloudData.settings.pluginVersion === '') {
      // 默认配置，使用本地配置覆盖
      cloudData.settings = localSettings.$state
    }
    const syncDataStore = useSyncDataStore()
    syncDataStore.$patch(cloudData)

    // 初始化时进行一次同步检查
    if (!(await syncDataStore.checkCloudSync())) {
      return
    }

    browser.runtime.sendMessage({
      type: 'SYNC_INITED'
    } as SyncMessage)

    // 监听同步储存更新消息
    browser.runtime.onMessage.addListener(handleSyncStorageUpdateMessage)

    // 监听变化触发同步
    // 追踪上一次的 sync.enabled 状态，避免用户手动开启云同步时立刻把
    // local lastUpdate 推新（导致本地覆盖云端）。当检测到由 false -> true
    // 的切换时，只执行一次 checkCloudSync()，不更新 lastUpdate。
    let prevSyncEnabled = localSettings.sync.enabled

    const subChange = async () => {
      const nowEnabled = localSettings.sync.enabled

      // 如果正在处理（静默中），先同步 prevSyncEnabled 再早退，避免状态滞后
      if (isProcessing) {
        prevSyncEnabled = nowEnabled
        return
      }

      if (!nowEnabled) {
        return
      }

      // 刚刚从未启用变为启用：不更新 lastUpdate，仅检查云端
      if (!prevSyncEnabled && nowEnabled) {
        prevSyncEnabled = true
        await syncDataStore.checkCloudSync()
        return
      }

      prevSyncEnabled = nowEnabled

      await localSyncDataStorage.setValue({
        lastUpdate: Date.now()
      })
      await syncDataStore.checkCloudSync()
    }

    localSettings.$subscribe(subChange)
    useShortcutStore().$subscribe(async (mutation, _state) => {
      if (mutation.type !== MutationType.direct) {
        // 防止刚开就认为数据过旧，只有initShortcut会整个替换state
        return
      }
      await subChange()
    })
  } catch (err) {
    if (syncEventCallback) {
      if (err instanceof Error) {
        syncEventCallback('sync-error', err)
      } else {
        syncEventCallback('sync-error', new Error(String(err)))
      }
    }
  } finally {
    isProcessing = false
  }
}

export async function deinitSyncSettings() {
  // 移除同步储存更新消息监听器
  browser.runtime.onMessage.removeListener(handleSyncStorageUpdateMessage)
}

const migrations: Record<number, (s: unknown) => Promise<unknown> | unknown> = {
  1: (s) => migrateFromVer1(s as OldSettingsInterface),
  2: (s) => migrateFromVer2To3(s as SettingsInterfaceVer2),
  3: (s) => migrateFromVer3To4(s as SettingsInterfaceVer3),
  4: (s) => migrateFromVer4To5(s as SettingsInterfaceVer4),
  5: (s) => migrateFromVer5To6(s as SettingsInterfaceVer5),
  6: (s) => migrateFromVer6To7(s as SettingsInterfaceVer6),
  7: (s) => migrateFromVer7To8(s as SettingsInterfaceVer7)
}

export const useSyncDataStore = defineStore('sync', {
  state: (): SyncData => ({
    settings: structuredClone(defaultSettings),
    bookmarks: structuredClone(defaultShortcut),
    lastUpdate: 0
  }),

  actions: {
    async checkCloudSync() {
      try {
        const localSettings = useSettingsStore()
        if (!localSettings.sync.enabled) {
          return false
        }

        const cloudData = await syncDataStorage.getValue()
        const localSyncData = await localSyncDataStorage.getValue()

        // 云端更新时间与本地更新时间一致
        if (cloudData.lastUpdate === localSyncData.lastUpdate) {
          return true
        }

        // 检查版本
        if (cloudData.settings.version > localSettings.version) {
          localSettings.sync.enabled = false
          if (syncEventCallback) {
            syncEventCallback('version-mismatch', {
              cloud: String(cloudData.settings.version),
              local: String(localSettings.version)
            })
          }
          return false
        }

        // 版本相同，检查更新时间
        if (cloudData.lastUpdate > localSyncData.lastUpdate) {
          await this.applyCloudData()
          return true
        }
        if (cloudData.lastUpdate < localSyncData.lastUpdate) {
          await this.syncToCloud()
          return true
        }
      } catch (err) {
        if (syncEventCallback) {
          if (err instanceof Error) {
            syncEventCallback('sync-error', err)
          } else {
            syncEventCallback('sync-error', new Error(String(err)))
          }
        }
      }
    },

    async syncToCloud() {
      try {
        const localSettings = useSettingsStore()
        if (!localSettings.sync.enabled) {
          return
        }

        const localShortcut = useShortcutStore()

        debouncedSend({
          settings: localSettings.$state,
          bookmarks: localShortcut.$state,
          lastUpdate: Date.now()
        } as SyncData)
      } catch (err) {
        if (syncEventCallback) {
          if (err instanceof Error) {
            syncEventCallback('sync-error', err)
          } else {
            syncEventCallback('sync-error', new Error(String(err)))
          }
        }
      }
    },

    async applyCloudData() {
      isProcessing = true
      try {
        const localSettings = useSettingsStore()
        const cloudData = await syncDataStorage.getValue()

        if (cloudData.settings.version < CURRENT_CONFIG_VERSION) {
          // 云端配置版本落后，逐步应用迁移直到达到当前版本
          try {
            let s = cloudData.settings

            // 老版本字符串场景直接走 1 号迁移
            if (typeof s.version === 'string') {
              const fn1 = migrations[1] as typeof migrateFromVer1
              if (fn1) s = await fn1(s as unknown as OldSettingsInterface)
            }

            // 逐步通过映射函数迁移到 CURRENT_CONFIG_VERSION
            while ((s.version as number) < CURRENT_CONFIG_VERSION) {
              const v = s.version as number
              const fn = migrations[v]
              if (!fn) {
                // 未知版本：关闭云同步并通知 UI 处理版本不匹配
                localSettings.sync.enabled = false
                if (syncEventCallback) {
                  syncEventCallback('version-mismatch', {
                    cloud: String(s.version),
                    local: String(localSettings.version)
                  })
                }
                return
              }
              // @ts-expect-error：此处s要经过多轮升级才会变为最新版本
              s = await fn(s)
            }

            const migratedSettings = s as CURRENT_CONFIG_INTERFACE
            cloudData.settings = migratedSettings
          } catch (err) {
            console.error(
              `Failed to migrate cloud settings from ${cloudData.settings.version} to ${CURRENT_CONFIG_VERSION}:`,
              err
            )
            // 迁移失败：关闭云同步并通知 UI
            localSettings.sync.enabled = false
            if (syncEventCallback) {
              if (err instanceof Error) {
                syncEventCallback('sync-error', err)
              } else {
                syncEventCallback('sync-error', new Error(String(err)))
              }
            }
            return
          }
        }

        cloudData.settings.background.bgType = localSettings.background.bgType // 保持本地背景类型
        cloudData.settings.background.local = localSettings.$state.background.local // 保持本地壁纸数据
        cloudData.settings.background.localDark = localSettings.$state.background.localDark || {
          id: '',
          url: '',
          mediaType: undefined
        } // 保持本地暗黑壁纸数据，旧版本无 localDarkBackground 所以加了个默认值
        cloudData.settings.background.bing = localSettings.$state.background.bing // 保持本地必应壁纸数据
        cloudData.settings.background.online.url = localSettings.$state.background.online.url // 保持本地在线壁纸URL

        localSettings.$patch(cloudData.settings)
        saveShortcut(cloudData.bookmarks)

        await localSyncDataStorage.setValue({
          lastUpdate: cloudData.lastUpdate
        })
      } catch (err) {
        if (syncEventCallback) {
          if (err instanceof Error) {
            syncEventCallback('sync-error', err)
          } else {
            syncEventCallback('sync-error', new Error(String(err)))
          }
        }
      } finally {
        isProcessing = false
      }
    }
  }
})
