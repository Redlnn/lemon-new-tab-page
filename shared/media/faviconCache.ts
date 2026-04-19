import localForage from 'localforage'

export const FAVICON_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

export interface FaviconCacheEntry {
  /** base64 数据 URL（例如 "data:image/...;base64,..."）或普通 HTTP/HTTPS 链接 */
  data: string
  /** 'base64' 表示完整的离线数据 URI；'url' 表示需要通过网络获取的地址 */
  type: 'base64' | 'url'
  /** 该条目被存储时的 Unix 时间戳（毫秒） */
  fetchedAt: number
}

const faviconStore = localForage.createInstance({
  name: '柠檬起始页',
  driver: localForage.INDEXEDDB,
  storeName: 'favicon',
})

/** 返回指定 origin 的缓存条目；若不存在或发生存储错误则返回 null。
 * 注意：该函数不会检查 TTL。调用方应比较 `entry.fetchedAt` 与 `FAVICON_CACHE_TTL`，并在过期时触发刷新。 */
export async function getFaviconCacheEntry(origin: string): Promise<FaviconCacheEntry | null> {
  try {
    return await faviconStore.getItem<FaviconCacheEntry>(origin)
  } catch {
    return null
  }
}

/** 将缓存条目写入（或覆盖）指定 origin。`entry.fetchedAt` 应为 `Date.now()`。
 * 存储失败时会静默忽略错误。 */
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

/** 删除指定 origin 的缓存条目（如果存在）。删除失败时会静默忽略错误。 */
export async function deleteFaviconCacheEntry(origin: string): Promise<void> {
  try {
    await faviconStore.removeItem(origin)
  } catch {
    // 缓存删除失败时静默处理
  }
}
