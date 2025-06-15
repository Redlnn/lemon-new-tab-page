import _ from 'lodash'

import { browser } from 'wxt/browser'
import { ElMessageBox } from 'element-plus'
import { syncSettingsStorage } from '../storages/syncSettingsStorage'
import { useSettingsStore } from './settingsStore'
import type { CURRENT_CONFTG_INTERFACE } from '../settings'
import { defineStore } from 'pinia'
import type { SyncMessage } from '@/entrypoints/background/types'

interface CloudData {
  settings?: Partial<CURRENT_CONFTG_INTERFACE>
  lastUpdate?: number
  version?: number
}

interface SyncState {
  enabled: boolean
  lastSyncTime: number
  syncing: boolean
  error: string | null
}

let syncDebounceTimer: number | undefined

function debouncedSync(fn: () => Promise<void>) {
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer)
  }

  syncDebounceTimer = window.setTimeout(async () => {
    try {
      await fn()
    } catch (err) {
      console.error('Sync failed:', err)
    }
  }, 2000)
}

export async function initSyncSettings() {
  const syncSettings = await syncSettingsStorage.getValue()
  const syncSettingsStore = useSyncSettingsStore()
  syncSettingsStore.$patch({
    ...syncSettings,
    lastSyncTime: 0,
    syncing: false,
    error: null
  })

  // 初始化时进行一次同步检查
  if (syncSettings.enabled) {
    await syncSettingsStore.checkCloudSync()
  }

  // 监听同步消息
  browser.runtime.onMessage.addListener((message: unknown) => {
    const isSyncMessage = (msg: unknown): msg is SyncMessage =>
      typeof msg === 'object' &&
      msg !== null &&
      'type' in msg &&
      typeof (msg as { type: unknown }).type === 'string' &&
      ((msg as { type: string }).type === 'SYNC_COMPLETED' ||
        (msg as { type: string }).type === 'SYNC_FAILED')

    if (!isSyncMessage(message)) {
      return
    }

    if (message.type === 'SYNC_COMPLETED') {
      syncSettingsStore.$patch({
        lastSyncTime: message.timestamp || Date.now(),
        syncing: false,
        error: null
      })
      // 应用云端更新的数据
      if (message.data?.settings) {
        const settingsStore = useSettingsStore()
        settingsStore.$patch(message.data.settings)
      }
    } else if (message.type === 'SYNC_FAILED') {
      syncSettingsStore.$patch({
        syncing: false,
        error: message.error || '同步失败'
      })
    }
  })
}

export const useSyncSettingsStore = defineStore('sync', {
  state: (): SyncState => ({
    enabled: false,
    lastSyncTime: 0,
    syncing: false,
    error: null
  }),

  actions: {
    async checkCloudSync() {
      if (!this.enabled) {
        return
      }

      try {
        const cloudData = (await browser.storage.sync.get()) as CloudData
        if (!cloudData?.settings) {
          return
        }

        const localSettings = useSettingsStore()

        // 检查版本
        if (cloudData.version && cloudData.version > localSettings.version) {
          // 云端版本更高，关闭同步并提示更新
          this.enabled = false
          await syncSettingsStorage.setValue({ enabled: false })
          await ElMessageBox.alert(
            '云端配置版本高于本地版本，请更新扩展后再使用云同步',
            '需要更新',
            { type: 'warning' }
          )
          return
        }

        if (cloudData.version && cloudData.version < localSettings.version) {
          // 本地版本更高，上传本地设置
          this.syncToCloud()
          return
        }

        // 版本相同，检查更新时间
        if (cloudData.lastUpdate && cloudData.lastUpdate > localSettings.lastUpdate) {
          // 云端更新较新，询问用户
          try {
            await ElMessageBox.confirm('云端设置比本地新，是否使用云端设置？', '发现冲突', {
              confirmButtonText: '使用云端设置',
              cancelButtonText: '使用本地设置',
              type: 'warning'
            })
            // 用户选择使用云端设置
            await this.applyCloudSettings(cloudData.settings)
          } catch {
            // 用户选择使用本地设置
            await this.syncToCloud()
          }
        }
      } catch (err) {
        const error = err as Error
        this.error = error.message
        console.error('Sync check failed:', error)
      }
    },

    async syncToCloud() {
      if (!this.enabled) {
        return
      }

      this.syncing = true
      const settingsStore = useSettingsStore()

      debouncedSync(async () => {
        try {
          await browser.runtime.sendMessage({
            type: 'SYNC_REQUEST',
            dataType: 'settings',
            data: {
              ...settingsStore.$state,
              lastUpdate: Date.now()
            }
          })
        } catch (err) {
          const error = err as Error
          this.error = error.message
          this.syncing = false
          console.error('Sync to cloud failed:', error)
        }
      })
    },

    async applyCloudSettings(cloudSettings: Partial<CURRENT_CONFTG_INTERFACE>) {
      const settingsStore = useSettingsStore()
      const state = settingsStore.$state

      // 保留本地壁纸缓存
      if (typeof state === 'object' && state !== null && 'wallpaper' in state) {
        const localWallpaper = {
          cachedId: state.wallpaper?.cachedId,
          cachedUrl: state.wallpaper?.cachedUrl,
          lastUpdate: state.wallpaper?.lastUpdate
        }

        const newSettings = {
          ...cloudSettings
        }

        if (
          typeof cloudSettings === 'object' &&
          cloudSettings !== null &&
          'wallpaper' in cloudSettings
        ) {
          newSettings.wallpaper = {
            ...cloudSettings.wallpaper,
            ...localWallpaper
          }
        }

        settingsStore.$patch(newSettings)
      } else {
        settingsStore.$patch(cloudSettings)
      }
    }
  }
})
