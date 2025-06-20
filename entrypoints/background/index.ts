import { browser } from 'wxt/browser'
import { BgType } from '@/shared/settings'
import type { SyncData, SyncMessage, SyncRequestMessage } from '@/shared/sync/types'
import { initSyncSettings, localSyncDataStorage, syncDataStorage } from '@/shared/sync'
import { defineBackground } from '#imports'

let isInited = false
let isRunning = false
const syncQueue: SyncData[] = []
const lastSyncTime = 0
const SYNC_INTERVAL = 2000 // 2 seconds

// 检查是否可以执行同步
function canSync(): boolean {
  //TODO: 判断配置是否开启云同步
  return syncQueue.length > 0 && Date.now() - lastSyncTime >= SYNC_INTERVAL
}

// 处理同步队列
async function processSyncQueue() {
  if (!canSync()) {
    return
  }
  console.log('can sync')

  const syncItem = syncQueue.shift()
  if (syncItem === undefined) {
    return
  }

  // lastSyncTime = Date.now()

  // 由于本地壁纸不同步且在线壁纸要重新由用户触发权限申请，所以重置回默认设置
  if ([BgType.Local, BgType.Online].includes(syncItem.settings.background.bgType)) {
    syncItem.settings.background.bgType = BgType.Bing
  }
  // 重置壁纸缓存数据
  syncItem.settings.localBackground = { id: '', url: '' }
  syncItem.settings.bingBackground = { id: '', url: '', updateDate: '' }
  // 由于无法同步在线壁纸，所以重置在线壁纸url
  syncItem.settings.background.onlineUrl = ''

  const dateNow = Date.now()

  await syncDataStorage.setValue({
    settings: syncItem.settings,
    bookmarks: syncItem.bookmarks,
    lastUpdate: dateNow
  })
  await localSyncDataStorage.setValue({
    lastUpdate: dateNow
  })
  // 通知所有标签页同步已完成
  const [tab] = await chrome.tabs.query({})
  if (tab.id) {
    await browser.tabs.sendMessage(tab.id, {
      type: 'SYNC_COMPLETED'
    } as SyncMessage)
  }
}

// --------------------------------------

export default defineBackground(() => {
  console.log('Hello from background')

  browser.runtime.onMessage.addListener((message) => {
    console.log(message)
    const isSyncMessage = (msg: unknown): msg is SyncMessage =>
      typeof msg === 'object' &&
      msg !== null &&
      'type' in msg &&
      typeof (msg as { type: unknown }).type === 'string' &&
      (msg as { type: string }).type.startsWith('SYNC_')

    if (!isSyncMessage(message)) {
      return
    }

    if (message.type === 'SYNC_INIT') {
      //TODO: initSyncSettings
    }
  })

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
      return
    }
  })

  syncDataStorage.watch(async () => {
    if (!isInited) {
      return
    }

    const [tab] = await chrome.tabs.query({ active: true })
    if (tab.id) {
      await browser.tabs.sendMessage(tab.id, {
        type: 'SYNC_UPDATE'
      } as SyncMessage)
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
