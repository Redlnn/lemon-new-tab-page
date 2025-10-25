import { browser } from 'wxt/browser'

import { defineBackground } from '#imports'

import { BgType, defaultSettings } from '@/shared/settings'
import { localSyncDataStorage, syncDataStorage } from '@/shared/sync'
import type { SyncData, SyncMessage, SyncRequestMessage } from '@/shared/sync/types'

let isInited = false
let isRunning = false
const syncQueue: SyncData[] = []
let lastSyncTime = 0
const SYNC_INTERVAL = 2000 // 2 seconds
const ALARM_NAME = 'sync-queue-tick'
let localTimer: ReturnType<typeof setTimeout> | null = null

const debugLog: (...args: unknown[]) => void = import.meta.env.DEV
  ? (...args) => console.log('[sync]', ...args)
  : () => {}

// 检查是否可以执行同步
function canSync(): boolean {
  return syncQueue.length > 0 && Date.now() - lastSyncTime >= SYNC_INTERVAL
}

// 处理同步队列
async function processSyncQueue() {
  if (!canSync()) {
    return
  }

  // 避免 shift 造成 O(n) 移动，改为读取首元素并整体清空/复用索引
  const firstItem = syncQueue[0]
  if (firstItem === undefined) {
    return
  }
  const queueLenAtStart = 1 + syncQueue.length
  const t0 = performance?.now?.() ?? Date.now()

  // 在开始处理前记录时间，确保以“开始时间”为节流基准，避免下个周期被跳过
  lastSyncTime = Date.now()

  // 批量聚合：选取 lastUpdate 最大的项进行写入，丢弃旧项以减少 IO 次数
  let syncItem: SyncData = firstItem
  let aggregatedCount = 1
  // 跳过首元素
  for (let i = 1, len = syncQueue.length; i < len; i++) {
    const next = syncQueue[i]!
    aggregatedCount += 1
    if (next.lastUpdate >= syncItem.lastUpdate) {
      syncItem = next
    }
  }
  // 清空队列中已被聚合的旧项（因为 syncItem 是全量快照，旧项没有继续保留的必要）
  syncQueue.length = 0
  // 由于本地壁纸不同步且在线壁纸要重新由用户触发权限申请，所以重置回默认设置
  const { bgType } = syncItem.settings.background

  // 如果使用本地或在线壁纸，需要重置背景类型（这些类型无法跨设备同步）
  if (bgType === BgType.Local || bgType === BgType.Online) {
    syncItem.settings.background.bgType = BgType.Bing
  }
  // 重置壁纸缓存数据
  syncItem.settings.localBackground = defaultSettings.localBackground
  syncItem.settings.localDarkBackground = defaultSettings.localDarkBackground
  syncItem.settings.bingBackground = defaultSettings.bingBackground
  // 由于无法同步在线壁纸，所以重置在线壁纸url
  syncItem.settings.background.onlineUrl = defaultSettings.background.onlineUrl

  await syncDataStorage.setValue({
    settings: syncItem.settings,
    bookmarks: syncItem.bookmarks,
    lastUpdate: syncItem.lastUpdate
  })
  await localSyncDataStorage.setValue({
    lastUpdate: syncItem.lastUpdate
  })

  const t1 = performance?.now?.() ?? Date.now()
  debugLog('processed', {
    queueLenAtStart,
    aggregatedCount,
    remaining: syncQueue.length,
    durationMs: Math.round(t1 - t0)
  })

  // 若仍有队列项，精确安排下一次处理
  if (syncQueue.length > 0) {
    scheduleLocalTick(SYNC_INTERVAL)
  }
}

function scheduleLocalTick(delay = SYNC_INTERVAL) {
  // 避免重复定时
  if (localTimer != null) {
    return
  }
  localTimer = setTimeout(async () => {
    localTimer = null
    if (!isInited || isRunning) {
      return
    }
    isRunning = true
    try {
      await processSyncQueue()
    } finally {
      isRunning = false
    }
  }, delay)
}

// --------------------------------------

export default defineBackground(() => {
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

    if (message.type === 'SYNC_INITED') {
      isInited = true
    }
  })

  // 监听来自标签页的同步请求
  browser.runtime.onMessage.addListener((message) => {
    if (!isInited) {
      return
    }

    const isSyncRequestMessage = (msg: unknown): msg is SyncRequestMessage =>
      typeof msg === 'object' &&
      msg !== null &&
      'type' in msg &&
      typeof (msg as { type: unknown }).type === 'string' &&
      (msg as { type: string }).type === 'SYNC_REQUEST'

    if (isSyncRequestMessage(message)) {
      syncQueue.push(message.data)
      debugLog('enqueue', { length: syncQueue.length, lastUpdate: message.data.lastUpdate })
      // 尽快处理一次，降低延迟
      if (!isRunning) {
        const elapsed = Date.now() - lastSyncTime
        const remaining = elapsed >= SYNC_INTERVAL ? 0 : SYNC_INTERVAL - elapsed
        scheduleLocalTick(remaining)
      }
    }
  })

  syncDataStorage.watch(async () => {
    if (!isInited) {
      return
    }

    const [tab] = await browser.tabs.query({
      active: true,
      status: 'complete'
    })
    if (tab?.id) {
      try {
        await browser.tabs.sendMessage(tab.id, {
          type: 'SYNC_UPDATE'
        } as SyncMessage)
      } catch {}
    }
  })

  // 使用浏览器 Alarms API 定期唤醒，避免 SW 挂起后 setInterval 丢失
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARM_NAME) {
      return
    }
    debugLog('alarm')
    if (!isInited || isRunning) {
      return
    }

    isRunning = true
    try {
      await processSyncQueue()
    } finally {
      isRunning = false
    }
  })

  // 创建周期性 alarm（注意：periodInMinutes 最小粒度通常为 1 分钟）
  try {
    browser.alarms.create(ALARM_NAME, {
      periodInMinutes: Math.max(SYNC_INTERVAL / 60000, 1)
    })
  } catch (err) {
    debugLog('alarms.create failed, fallback to local tick only', err)
    // 兜底：如果浏览器不支持 alarms，则维持本地 tick
    scheduleLocalTick(SYNC_INTERVAL)
  }
})
