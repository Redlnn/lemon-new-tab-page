import { browser } from 'wxt/browser'

import { defineBackground } from '#imports'

import { BgType, defaultSettings } from '@/shared/settings'
import type { SyncData, SyncMessage, SyncRequestMessage } from '@/shared/sync'
import { localSyncDataStorage, syncDataStorage } from '@/shared/sync'

let isInited = false
let isRunning = false
// 仅保留 latest snapshot（single-latest-item），以 O(1) 复杂度处理高频更新
let latestSyncItem: SyncData | null = null
// 统计自上次处理以来入队次数（用于更准确的日志）
let enqueuedSinceLastProcess = 0
// 统计被覆盖/丢弃的次数（可选监控）
let droppedSinceLastProcess = 0
let lastSyncTime = 0
const SYNC_INTERVAL = 2000 // 2 seconds
const ALARM_NAME = 'sync-queue-tick'
let localTimer: ReturnType<typeof setTimeout> | null = null
let localTimerExpiry = 0 // 时间戳（ms），记录本地 timer 到期时间以支持提前重设

const debugLog: (...args: unknown[]) => void = import.meta.env.DEV
  ? (...args) => console.log('[sync]', ...args)
  : () => {}

// 检查是否可以执行同步
function canSync(): boolean {
  return latestSyncItem !== null && Date.now() - lastSyncTime >= SYNC_INTERVAL
}

// 处理同步队列
async function processSyncQueue() {
  if (!canSync()) {
    return
  }

  // 以 latestSyncItem 为唯一待处理项，记录入队统计并清空相关状态
  const syncItem = latestSyncItem
  const queueLenAtStart = enqueuedSinceLastProcess
  const dropped = droppedSinceLastProcess
  if (!syncItem) return
  const t0 = performance?.now?.() ?? Date.now()

  // 以开始处理时间为节流基准
  lastSyncTime = Date.now()
  // 清空待处理项与统计
  latestSyncItem = null
  enqueuedSinceLastProcess = 0
  droppedSinceLastProcess = 0
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
  await localSyncDataStorage.setValue({ lastUpdate: syncItem.lastUpdate })

  const t1 = performance?.now?.() ?? Date.now()
  debugLog('processed', {
    queueLenAtStart,
    dropped,
    durationMs: Math.round(t1 - t0)
  })

  // 如果在处理期间又有新的待处理项，安排下一次处理
  if (latestSyncItem !== null) {
    scheduleLocalTick(SYNC_INTERVAL)
  }
}

function scheduleLocalTick(delay = SYNC_INTERVAL) {
  const now = Date.now()
  const desiredExpiry = now + delay

  // 如果已有 timer 且新计划不比当前更早，则保持现有 timer
  if (localTimer != null) {
    const remaining = Math.max(localTimerExpiry - now, 0)
    if (delay >= remaining) {
      return
    }
    // 新的计划更早，重设 timer
    clearTimeout(localTimer)
    localTimer = null
    localTimerExpiry = 0
  }

  localTimer = setTimeout(
    async () => {
      localTimer = null
      localTimerExpiry = 0
      if (!isInited || isRunning) {
        return
      }
      isRunning = true
      try {
        await processSyncQueue()
      } finally {
        isRunning = false
      }
    },
    Math.max(0, delay)
  )
  localTimerExpiry = desiredExpiry
}

// --------------------------------------

const isSyncMessage = (msg: unknown): msg is SyncMessage =>
  typeof msg === 'object' &&
  msg !== null &&
  'type' in msg &&
  typeof (msg as { type: unknown }).type === 'string' &&
  (msg as { type: string }).type.startsWith('SYNC_')

const isSyncRequestMessage = (msg: unknown): msg is SyncRequestMessage =>
  typeof msg === 'object' &&
  msg !== null &&
  'type' in msg &&
  typeof (msg as { type: unknown }).type === 'string' &&
  (msg as { type: string }).type === 'SYNC_REQUEST'

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message) => {
    if (isSyncMessage(message) && message.type === 'SYNC_INITED') {
      isInited = true
    }

    if (isInited && isSyncRequestMessage(message)) {
      const incoming = message.data
      // 保留最新的 snapshot（基于 lastUpdate）
      if (!latestSyncItem || incoming.lastUpdate >= latestSyncItem.lastUpdate) {
        latestSyncItem = incoming
      }
      debugLog('enqueue', { pending: latestSyncItem ? 1 : 0, lastUpdate: incoming.lastUpdate })
      // 尽快处理一次，降低延迟
      if (!isRunning) {
        const elapsed = Date.now() - lastSyncTime
        const remaining = elapsed >= SYNC_INTERVAL ? 0 : SYNC_INTERVAL - elapsed
        scheduleLocalTick(remaining)
      }
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
