import { browser } from 'wxt/browser'

import { defineBackground } from '#imports'

import { BgType } from '@/shared/settings'
import type { SyncData, SyncMessage, SyncRequestMessage } from '@/shared/sync/types'
import { localSyncDataStorage, syncDataStorage } from '@/shared/sync'

let isInited = false
let isRunning = false
const syncQueue: SyncData[] = []
const lastSyncTime = 0
const SYNC_INTERVAL = 2000 // 2 seconds

// 检查是否可以执行同步
function canSync(): boolean {
  return syncQueue.length > 0 && Date.now() - lastSyncTime >= SYNC_INTERVAL
}

// 处理同步队列
async function processSyncQueue() {
  if (!canSync()) {
    return
  }

  const syncItem = syncQueue.shift()
  if (syncItem === undefined) {
    return
  }
  // 由于本地壁纸不同步且在线壁纸要重新由用户触发权限申请，所以重置回默认设置
  if ([BgType.Local, BgType.Online].includes(syncItem.settings.background.bgType)) {
    syncItem.settings.background.bgType = BgType.Bing
  }
  // 重置壁纸缓存数据
  syncItem.settings.localBackground = { id: '', url: '' }
  syncItem.settings.localDarkBackground = { id: '', url: '' }
  syncItem.settings.bingBackground = { id: '', url: '', updateDate: '' }
  // 由于无法同步在线壁纸，所以重置在线壁纸url
  syncItem.settings.background.onlineUrl = ''

  await syncDataStorage.setValue({
    settings: syncItem.settings,
    bookmarks: syncItem.bookmarks,
    lastUpdate: syncItem.lastUpdate
  })
  await localSyncDataStorage.setValue({
    lastUpdate: syncItem.lastUpdate
  })
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

  // 定期检查同步队列
  setInterval(async () => {
    if (!isInited || isRunning) {
      return
    }

    isRunning = true
    try {
      await processSyncQueue()
    } finally {
      isRunning = false
    }
  }, SYNC_INTERVAL)
})
