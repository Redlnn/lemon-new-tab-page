import { useDebounceFn } from '@vueuse/core'
import { browser } from 'wxt/browser'
import { defineStore } from 'pinia'

import { defaultSettings, useSettingsStore, type CURRENT_CONFTG_INTERFACE } from '../settings'
import { defaultBookmark, useBookmarkStore } from '../bookmark'

import { localSyncDataStorage, syncDataStorage } from './syncDataStorage'
import type { SyncData, SyncMessage } from './types'

const debouncedSend = useDebounceFn(async (data: SyncData) => {
  try {
    await browser.runtime.sendMessage({
      type: 'SYNC_REQUEST',
      data
    })
  } catch (err) {
    const error = err as Error
    console.error('Sync to cloud failed:', error)
  }
}, 2000)

export async function initSyncSettings(localSettings: CURRENT_CONFTG_INTERFACE) {
  const syncDataStore = useSyncDataStore()

  // 初始化时进行一次同步检查
  if (localSettings.sync.enabled) {
    await syncDataStore.checkCloudSync()
  }

  browser.runtime.sendMessage({
    type: 'SYNC_INITED'
  } as SyncMessage)

  // 监听同步消息
  browser.runtime.onMessage.addListener((message) => {
    const isSyncMessage = (msg: unknown): msg is SyncMessage =>
      typeof msg === 'object' &&
      msg !== null &&
      'type' in msg &&
      typeof (msg as { type: unknown }).type === 'string' &&
      (msg as { type: string }).type.startsWith('SYNC_')

    if (!isSyncMessage(message)) {
      return
    }

    if (message.type === 'SYNC_FAILED') {
      ElNotification({
        title: 'SYNC_ERROR',
        message: 'SYNC FAILED',
        type: 'error'
      })
    }
  })
}

export const useSyncDataStore = defineStore('sync', {
  state: (): SyncData => ({
    settings: structuredClone(defaultSettings),
    bookmarks: structuredClone(defaultBookmark),
    lastUpdate: 0
  }),

  actions: {
    async checkCloudSync(cloudData?: SyncData) {
      if (!this.settings.sync.enabled) {
        return
      }

      let data
      if (cloudData === undefined) {
        data = await syncDataStorage.getValue()
      } else {
        data = cloudData
      }

      const localSyncData = await localSyncDataStorage.getValue()
      const localSettings = useSettingsStore()

      // 检查版本
      if (data.settings.version > localSettings.version) {
        // 云端版本更高，关闭同步并提示更新
        localSettings.sync.enabled = false
        // TODO: 云端配置版本高于本地版本，请更新扩展后再使用云同步
        return
      }

      // 版本相同，检查更新时间
      if (data.lastUpdate > localSyncData.lastUpdate) {
        // 云端更新较新
        await this.applyCloudData(data)
      } else {
        await this.syncToCloud()
      }
    },

    async syncToCloud() {
      if (!this.settings.sync.enabled) {
        return
      }

      const localSettings = useSettingsStore()
      const localbookmark = useBookmarkStore()

      await debouncedSend({
        settings: localSettings.$state,
        bookmarks: localbookmark.$state,
        lastUpdate: Date.now()
      })
    },

    async applyCloudData(cloudData: SyncData) {
      const localSettings = useSettingsStore()
      const localbookmark = useBookmarkStore()

      const { localBackground: _a, bingBackground: _b, ...newSettings } = cloudData.settings

      localSettings.$patch(newSettings)
      localbookmark.$patch(cloudData.bookmarks)
    }
  }
})
