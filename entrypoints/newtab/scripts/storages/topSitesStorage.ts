import { storage } from 'wxt/storage'

export const blockedTopStitesStorage = storage.defineItem<string[]>('local:blockedTopStites', {
  fallback: []
})
