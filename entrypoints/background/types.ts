import type { CURRENT_CONFTG_INTERFACE } from '@newtab/scripts/settings'
import type { Bookmark } from '@newtab/scripts/storages/bookmarkStorage'

export interface SyncData {
  settings?: CURRENT_CONFTG_INTERFACE | undefined
  bookmarks?: Bookmark[] | undefined
  lastUpdate: number
  version: number
}

export interface SyncMessage {
  type: 'SYNC_REQUEST' | 'SYNC_COMPLETED' | 'SYNC_FAILED'
  dataType?: 'settings' | 'bookmarks'
  data?: CURRENT_CONFTG_INTERFACE | Bookmark[]
  timestamp?: number
  error?: string
}

export type SyncDataType<T extends 'settings' | 'bookmarks'> = T extends 'settings'
  ? CURRENT_CONFTG_INTERFACE
  : T extends 'bookmarks'
    ? Bookmark[]
    : never

export interface SyncQueueItem<T extends 'settings' | 'bookmarks' = 'settings' | 'bookmarks'> {
  type: T
  data: SyncDataType<T>
  timestamp: number
}
