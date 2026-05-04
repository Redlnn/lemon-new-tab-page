import { storage } from '#imports'

import { CURRENT_CONFIG_VERSION, defaultSettings } from '../settings'
import { defaultShortcuts } from '../shortcut/shortcutStorage'

import { defaultSyncedCustomSearchEngines } from './types'
import type { LocalSyncMeta, SyncEnvelopeV1 } from './types'

export const syncDataStorage = storage.defineItem<SyncEnvelopeV1>('sync:syncData', {
  fallback: {
    _v: 1,
    configVersion: CURRENT_CONFIG_VERSION,
    fromDeviceId: '',
    fromDeviceName: '',
    settings: defaultSettings,
    bookmarks: defaultShortcuts,
    customSearchEngines: defaultSyncedCustomSearchEngines,
    lastUpdate: 0,
    version: 0,
    baseVersion: 0,
  },
})

export const localSyncMetaStorage = storage.defineItem<LocalSyncMeta>('local:syncMeta', {
  fallback: {
    deviceId: '',
    deviceName: '',
    lastSyncedAt: 0,
    localModifiedAt: 0,
    localVersion: 0,
  },
})
