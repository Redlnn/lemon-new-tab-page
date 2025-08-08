import type { CURRENT_CONFIG_INTERFACE } from '@/shared/settings'
import type { Bookmark } from '@/shared/bookmark/bookmarkStorage'

export interface LocalSyncData {
  lastUpdate: number
}
export interface SyncData extends LocalSyncData {
  settings: CURRENT_CONFIG_INTERFACE
  bookmarks: Bookmark
}

export interface SyncMessage {
  type: 'SYNC_REQUEST' | 'SYNC_INITED' | 'SYNC_UPDATE'
}

export interface SyncRequestMessage extends SyncMessage {
  type: 'SYNC_REQUEST'
  data: SyncData
}
