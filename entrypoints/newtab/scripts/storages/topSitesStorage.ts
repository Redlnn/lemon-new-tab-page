import { storage } from '#imports'

export const blockedTopStitesStorage = storage.defineItem<string[]>('local:blockedTopStites', {
  fallback: []
})
