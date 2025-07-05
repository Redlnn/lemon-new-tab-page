import { storage } from '#imports'
import { defaultSettings } from '../settings'
import { defaultBookmark } from '../bookmark/bookmarkStorage'
import type { SyncData, LocalSyncData } from './types'

export const syncDataStorage = storage.defineItem<SyncData>('sync:syncData', {
  fallback: {
    settings: defaultSettings,
    bookmarks: defaultBookmark,
    lastUpdate: 0
  }
})

export const localSyncDataStorage = storage.defineItem<LocalSyncData>('local:syncData', {
  fallback: {
    lastUpdate: 1
  }
})
