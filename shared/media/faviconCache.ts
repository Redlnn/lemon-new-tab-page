import localForage from 'localforage'

export const FAVICON_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

export interface FaviconCacheEntry {
  /** base64 data URL ("data:image/...;base64,...") or plain http/https URL */
  data: string
  /** 'base64' = fully offline data URI; 'url' = still needs network */
  type: 'base64' | 'url'
  /** Unix timestamp (ms) when this entry was stored */
  fetchedAt: number
}

const faviconStore = localForage.createInstance({
  name: '柠檬起始页',
  driver: localForage.INDEXEDDB,
  storeName: 'favicon',
})

/** Returns the cached entry for `origin`, or null if absent or on storage error.
 * NOTE: Does NOT check TTL — callers must compare `entry.fetchedAt` against
 * `FAVICON_CACHE_TTL` and treat expired entries as needing refresh. */
export async function getFaviconCacheEntry(origin: string): Promise<FaviconCacheEntry | null> {
  try {
    return await faviconStore.getItem<FaviconCacheEntry>(origin)
  } catch {
    return null
  }
}

/** Writes (or overwrites) the entry for `origin`. `entry.fetchedAt` should be `Date.now()`.
 *  Silently ignores storage errors. */
export async function setFaviconCacheEntry(
  origin: string,
  entry: FaviconCacheEntry,
): Promise<void> {
  try {
    await faviconStore.setItem(origin, entry)
  } catch {
    // 缓存写入失败时静默处理
  }
}

/** Removes the entry for `origin` if it exists. Silently ignores storage errors. */
export async function deleteFaviconCacheEntry(origin: string): Promise<void> {
  try {
    await faviconStore.removeItem(origin)
  } catch {
    // 缓存删除失败时静默处理
  }
}
