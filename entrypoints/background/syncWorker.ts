import _ from 'lodash'
import { browser } from 'wxt/browser'
import type { CURRENT_CONFTG_INTERFACE } from '@newtab/scripts/settings'
import type { Bookmark } from '@newtab/scripts/storages/bookmarkStorage'
import type { SyncData, SyncDataType, SyncQueueItem } from './types'

const syncQueue: SyncQueueItem[] = []
let lastSyncTime = 0
const SYNC_INTERVAL = 2000 // 2 seconds
const SYNC_RETRY_MAX = 3
let syncRetryCount = 0

// 清理壁纸相关的缓存数据
function cleanWallpaperCache(settings: CURRENT_CONFTG_INTERFACE): CURRENT_CONFTG_INTERFACE {
  const cleanedSettings = _.cloneDeep(settings)
  if (
    'wallpaper' in cleanedSettings &&
    typeof cleanedSettings.wallpaper === 'object' &&
    cleanedSettings.wallpaper !== null
  ) {
    const wallpaper = cleanedSettings.wallpaper as {
      cachedId?: string | null
      cachedUrl?: string | null
      lastUpdate?: number | null
    }
    wallpaper.cachedId = null
    wallpaper.cachedUrl = null
    wallpaper.lastUpdate = null
  }
  return cleanedSettings
}

interface SyncMessage {
  type: 'SYNC_REQUEST'
  dataType: 'settings' | 'bookmarks'
  data: SyncDataType<'settings' | 'bookmarks'>
  timestamp?: number
}

// 检查是否可以执行同步
function canSync(): boolean {
  return syncQueue.length > 0 && Date.now() - lastSyncTime >= SYNC_INTERVAL
}

// 处理同步队列
async function processSyncQueue() {
  if (!canSync()) {
    return
  }

  try {
    const rawData = await browser.storage.sync.get()
    const currentData = rawData as unknown as Partial<SyncData>
    const items = syncQueue.splice(0, syncQueue.length)
    lastSyncTime = Date.now()

    const mergedData: SyncData = {
      ...currentData,
      lastUpdate: lastSyncTime,
      version: currentData.version || 1
    }

    // 合并新数据
    items.forEach((item) => {
      if (item.type === 'settings') {
        mergedData.settings = cleanWallpaperCache(item.data as CURRENT_CONFTG_INTERFACE)
      } else if (item.type === 'bookmarks') {
        mergedData.bookmarks = item.data as Bookmark[]
      }
    })

    // 将 SyncData 转换为可以存储的格式
    const storageData = Object.entries(mergedData).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, unknown>
    )

    await browser.storage.sync.set(storageData)
    syncRetryCount = 0

    // 通知所有标签页同步已完成
    await browser.runtime.sendMessage({
      type: 'SYNC_COMPLETED',
      timestamp: lastSyncTime,
      data: mergedData
    })
  } catch (error) {
    console.error('Sync failed:', error)
    syncRetryCount++

    if (syncRetryCount < SYNC_RETRY_MAX) {
      // 稍后重试
      setTimeout(processSyncQueue, SYNC_INTERVAL)
    } else {
      // 达到最大重试次数，通知失败
      await browser.runtime.sendMessage({
        type: 'SYNC_FAILED',
        error: error instanceof Error ? error.message : '同步失败'
      })
      syncRetryCount = 0
    }
  }
}

// 监听来自标签页的同步请求
browser.runtime.onMessage.addListener((message: unknown) => {
  const syncMessage = message as SyncMessage
  if (syncMessage.type === 'SYNC_REQUEST') {
    syncQueue.push({
      type: syncMessage.dataType,
      data: syncMessage.data,
      timestamp: syncMessage.timestamp || Date.now()
    })
    void processSyncQueue()
  }
})

// 定期检查同步队列
setInterval(processSyncQueue, SYNC_INTERVAL)
