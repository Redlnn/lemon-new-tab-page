import type { CURRENT_CONFIG_SCHEMA } from '@/shared/settings'
import type { Shortcuts } from '@/shared/shortcut/shortcutStorage'

export interface SyncedCustomSearchEngine {
  id: string
  name: string
  url: string
  icon?: string
}

export interface SyncedCustomSearchEngineStorage {
  items: SyncedCustomSearchEngine[]
}

export const defaultSyncedCustomSearchEngines: SyncedCustomSearchEngineStorage = {
  items: [],
}

export interface SyncEnvelopeV1 {
  _v: 1
  configVersion: number
  fromDeviceId: string
  fromDeviceName: string
  lastUpdate: number
  settings: CURRENT_CONFIG_SCHEMA
  bookmarks: Shortcuts
  customSearchEngines: SyncedCustomSearchEngineStorage
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isValidTimestamp = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

const isValidCustomSearchEngineStorage = (
  value: unknown,
): value is SyncedCustomSearchEngineStorage => {
  if (!isObjectRecord(value) || !Array.isArray(value.items)) {
    return false
  }

  return value.items.every((item) => {
    if (!isObjectRecord(item)) return false
    return (
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.url === 'string' &&
      (item.icon === undefined || typeof item.icon === 'string')
    )
  })
}

export const isSyncEnvelopeV1 = (value: unknown): value is SyncEnvelopeV1 => {
  if (!isObjectRecord(value)) return false

  return (
    value._v === 1 &&
    typeof value.configVersion === 'number' &&
    typeof value.fromDeviceId === 'string' &&
    typeof value.fromDeviceName === 'string' &&
    isValidTimestamp(value.lastUpdate) &&
    isObjectRecord(value.settings) &&
    isObjectRecord(value.bookmarks) &&
    isValidCustomSearchEngineStorage(value.customSearchEngines)
  )
}

export interface LocalSyncMeta {
  deviceId: string
  deviceName: string
  lastSyncedAt: number
  localModifiedAt: number
}

export interface SyncMessage {
  type: 'SYNC_REQUEST' | 'SYNC_INITED' | 'SYNC_UPDATE'
}

export interface SyncRequestMessage extends SyncMessage {
  type: 'SYNC_REQUEST'
  data: SyncEnvelopeV1
}

export type SyncEventType = 'legacy-detected' | 'version-too-new' | 'conflict' | 'sync-error'

export type SyncEventPayloadMap = {
  'legacy-detected': undefined
  'version-too-new': { cloud: number; local: number }
  conflict: {
    cloud: { lastUpdate: number; fromDeviceName: string; fromDeviceId: string }
    local: { localModifiedAt: number }
  }
  'sync-error': Error
}
