import { storage } from '#imports'

// storage key 拼写错误，保持兼容性不改动
export const blockedTopSitesStorage = storage.defineItem<string[]>('local:blockedTopStites', {
  fallback: []
})
