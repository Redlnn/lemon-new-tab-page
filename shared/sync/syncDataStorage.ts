import { storage } from '#imports'

import { defaultSettings } from '../settings'
import { defaultShortcut } from '../shortcut/shortcutStorage'
import type { LocalSyncData, SyncData } from './types'

export const syncDataStorage = storage.defineItem<SyncData>('sync:syncData', {
  fallback: {
    settings: defaultSettings,
    bookmarks: defaultShortcut,
    lastUpdate: 0
  }
})

export const localSyncDataStorage = storage.defineItem<LocalSyncData>('local:syncData', {
  fallback: {
    lastUpdate: 1
  }
})
