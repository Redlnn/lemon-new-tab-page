import { idbDelete, idbGet, idbSet } from '@/shared/storage/idb'

export type { FaviconCacheEntry } from '@/shared/storage/idb'

export const FAVICON_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

/** 返回指定 origin 的缓存条目；若不存在或发生存储错误则返回 null。
 * 注意：该函数不会检查 TTL。调用方应比较 `entry.fetchedAt` 与 `FAVICON_CACHE_TTL`，并在过期时触发刷新。 */
export async function getFaviconCacheEntry(origin: string) {
  try {
    return (await idbGet('favicon', origin)) ?? null
  } catch {
    return null
  }
}

/** 将缓存条目写入（或覆盖）指定 origin。`entry.fetchedAt` 应为 `Date.now()`。
 * 存储失败时会静默忽略错误。 */
export async function setFaviconCacheEntry(
  origin: string,
  entry: import('@/shared/storage/idb').FaviconCacheEntry,
): Promise<void> {
  try {
    await idbSet('favicon', origin, entry)
  } catch {
    // 缓存写入失败时静默处理
  }
}

/** 删除指定 origin 的缓存条目（如果存在）。删除失败时会静默忽略错误。 */
export async function deleteFaviconCacheEntry(origin: string): Promise<void> {
  try {
    await idbDelete('favicon', origin)
  } catch {
    // 缓存删除失败时静默处理
  }
}
