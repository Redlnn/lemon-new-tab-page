import { defineStore, MutationType } from 'pinia'
import { useDebounceFn } from '@vueuse/core'

import { browser } from 'wxt/browser'

import { defaultBookmark, saveBookmark, useBookmarkStore } from '../bookmark'
import { defaultSettings, useSettingsStore } from '../settings'
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
      cloudData.settings = localSettings
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
    const subChange = async () => {
      if (isProcessing || !localSettings.sync.enabled) {
        return
      }

      await localSyncDataStorage.setValue({
        lastUpdate: Date.now()
      })
      await syncDataStore.checkCloudSync()
    }

    localSettings.$subscribe(subChange)
    useBookmarkStore().$subscribe(async (mutation, _state) => {
      if (mutation.type !== MutationType.direct) {
        // 防止刚开就认为数据过旧，只有initBookmark会整个替换state
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

export const useSyncDataStore = defineStore('sync', {
  state: (): SyncData => ({
    settings: structuredClone(defaultSettings),
    bookmarks: structuredClone(defaultBookmark),
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

        const localbookmark = useBookmarkStore()

        debouncedSend({
          settings: localSettings.$state,
          bookmarks: localbookmark.$state,
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

        cloudData.settings.background.bgType = localSettings.background.bgType // 保持本地背景类型
        cloudData.settings.localBackground = localSettings.$state.localBackground // 保持本地壁纸数据
        cloudData.settings.localDarkBackground = localSettings.$state.localDarkBackground || {
          id: '',
          url: '',
          mediaType: undefined
        } // 保持本地暗黑壁纸数据，旧版本无 localDarkBackground 所以加了个默认值
        cloudData.settings.bingBackground = localSettings.$state.bingBackground // 保持本地必应壁纸数据
        cloudData.settings.background.onlineUrl = localSettings.background.onlineUrl // 保持本地在线壁纸URL

        localSettings.$patch(cloudData.settings)
        saveBookmark(cloudData.bookmarks)

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
