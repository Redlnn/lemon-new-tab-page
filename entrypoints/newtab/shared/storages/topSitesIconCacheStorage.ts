import { storage } from '#imports'

export const topSitesIconCacheStorage = storage.defineItem<Record<string, string>>(
  'local:topSitesIconCache',
  { fallback: {} },
)
