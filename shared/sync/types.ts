import type { CURRENT_CONFIG_SCHEMA } from '@/shared/settings'
import type { Shortcuts } from '@/shared/shortcut/shortcutStorage'

export interface LocalSyncData {
  lastUpdate: number
}

export interface SyncData extends LocalSyncData {
  settings: CURRENT_CONFIG_SCHEMA
  bookmarks: Shortcuts
}

export interface SyncMessage {
  type: 'SYNC_REQUEST' | 'SYNC_INITED' | 'SYNC_UPDATE'
}

export interface SyncRequestMessage extends SyncMessage {
  type: 'SYNC_REQUEST'
  data: SyncData
}
