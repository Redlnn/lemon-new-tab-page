import { defineBackground } from '#imports'
import { browser } from 'wxt/browser'

import { syncDataStorage } from '@/shared/sync/syncDataStorage'
import { isSyncEnvelopeV1 } from '@/shared/sync/types'
import type { SyncEnvelopeV1, SyncMessage, SyncRequestMessage } from '@/shared/sync/types'

let isInited = false
let isRunning = false
// 仅保留 latest snapshot（single-latest-item），以 O(1) 复杂度处理高频更新
let latestSyncItem: SyncEnvelopeV1 | null = null
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
  const currentCloud = await syncDataStorage.getValue()
  let wrote = false
  if (isSyncEnvelopeV1(currentCloud) && currentCloud.lastUpdate > syncItem.lastUpdate) {
    debugLog('rejected stale push', {
      incoming: syncItem.lastUpdate,
      cloud: currentCloud.lastUpdate,
    })
  } else {
    await syncDataStorage.setValue(syncItem)
    wrote = true
  }

  const t1 = performance?.now?.() ?? Date.now()
  debugLog('processed', {
    queueLenAtStart,
    dropped,
    wrote,
    durationMs: Math.round(t1 - t0),
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
    Math.max(0, delay),
  )
  localTimerExpiry = desiredExpiry
}

// --------------------------------------

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasStringType = (value: unknown): value is { type: string } =>
  isObjectRecord(value) && typeof value.type === 'string'

const isSyncMessage = (msg: unknown): msg is SyncMessage =>
  hasStringType(msg) && msg.type.startsWith('SYNC_')

const parseSyncRequestMessage = (msg: unknown): SyncRequestMessage | null => {
  if (!isObjectRecord(msg) || msg.type !== 'SYNC_REQUEST' || !('data' in msg)) {
    return null
  }

  if (!isSyncEnvelopeV1(msg.data)) {
    return null
  }

  return {
    type: 'SYNC_REQUEST',
    data: msg.data,
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message) => {
    if (isSyncMessage(message) && message.type === 'SYNC_INITED') {
      isInited = true
    }

    const syncRequest = isInited ? parseSyncRequestMessage(message) : null
    if (syncRequest) {
      const incoming = syncRequest.data
      enqueuedSinceLastProcess += 1
      // 保留最新的 snapshot（基于 lastUpdate）
      if (!latestSyncItem || incoming.lastUpdate >= latestSyncItem.lastUpdate) {
        if (latestSyncItem) {
          droppedSinceLastProcess += 1
        }
        latestSyncItem = incoming
      } else {
        droppedSinceLastProcess += 1
      }
      debugLog('enqueue', { pending: latestSyncItem ? 1 : 0, lastUpdate: incoming.lastUpdate })
      // 尽快处理一次，降低延迟
      if (!isRunning) {
        const elapsed = Date.now() - lastSyncTime
        const remaining = elapsed >= SYNC_INTERVAL ? 0 : SYNC_INTERVAL - elapsed
        scheduleLocalTick(remaining)
      }
    } else if (isInited && isSyncMessage(message) && message.type === 'SYNC_REQUEST') {
      debugLog('ignored invalid SYNC_REQUEST payload')
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
      status: 'complete',
    })
    if (tab?.id) {
      const syncUpdateMessage: SyncMessage = { type: 'SYNC_UPDATE' }
      try {
        await browser.tabs.sendMessage(tab.id, syncUpdateMessage)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (
          message.includes('Receiving end does not exist') ||
          message.includes('Could not establish connection')
        ) {
          debugLog('SYNC_UPDATE skipped: active tab has no receiver')
          return
        }
        console.warn('[sync] Failed to notify active tab about SYNC_UPDATE', err)
      }
    }
  })

  // 创建周期性 alarm（注意：periodInMinutes 最小粒度通常为 1 分钟）
  try {
    browser.alarms.create(ALARM_NAME, {
      periodInMinutes: Math.max(SYNC_INTERVAL / 60000, 1),
    })
  } catch (err) {
    debugLog('alarms.create failed, fallback to local tick only', err)
    // 兜底：如果浏览器不支持 alarms，则维持本地 tick
    scheduleLocalTick(SYNC_INTERVAL)
  }
})
