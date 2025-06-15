import { storage } from '#imports'

export interface SyncSettings {
  enabled: boolean
}

export const syncSettingsStorage = storage.defineItem<SyncSettings>('sync:syncSettings', {
  fallback: { enabled: false }
})
