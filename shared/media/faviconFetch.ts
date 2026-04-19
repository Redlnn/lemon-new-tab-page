// shared/media/faviconFetch.ts
import { browser } from '#imports'

import {
  deleteFaviconCacheEntry,
  FAVICON_CACHE_TTL,
  getFaviconCacheEntry,
  setFaviconCacheEntry,
  type FaviconCacheEntry,
} from './faviconCache'

// ---------------------------------------------------------------------------
// 图标缓存总开关（由设置控制，默认关闭）
// ---------------------------------------------------------------------------
let _cacheEnabled = false

/** 由 newtab main.ts 在设置加载后调用以初始化缓存行为，并在设置变更时再次调用。 */
export function setFaviconCacheEnabled(enabled: boolean): void {
  _cacheEnabled = enabled
}

// ---------------------------------------------------------------------------
// L1 内存缓存（会话生命周期）
// ---------------------------------------------------------------------------
const l1Cache = new Map<string, FaviconCacheEntry>()

// 去重：防止对同一 origin 发起多个并发请求
const pendingFetches = new Map<string, Promise<string | null>>()

// ---------------------------------------------------------------------------
// 引用计数（会话生命周期）
// ---------------------------------------------------------------------------
const refCounts = new Map<string, number>()
// 引用计数降到零后安排的清理定时器（避免立即对 L2 造成抖动）
const cleanupTimers = new Map<string, ReturnType<typeof setTimeout>>()
// 在最后一次 release 后真正移除 L1/L2 条目的延迟（毫秒）
const CLEANUP_DELAY_MS = 10_000

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

/** 将 Blob 转换为 base64 数据 URL */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/** 从任意 URL 字符串中提取规范化的 origin（例如 https://example.com）。若解析失败则返回 null。 */
function toOrigin(url: string): string | null {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

/** 使用 HTMLImageElement 试探给定 URL 是否可用（无需 CORS，基于加载结果判断）。 */
function probeImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

// ---------------------------------------------------------------------------
// 获取策略
// ---------------------------------------------------------------------------

/** 策略 A：使用 Chromium 内部的 /_favicon/ API（返回 base64） */
async function fetchViaChromeFaviconApi(pageUrl: string): Promise<string | null> {
  try {
    const apiUrl = new URL(chrome.runtime.getURL('/_favicon/'))
    apiUrl.searchParams.set('pageUrl', pageUrl)
    apiUrl.searchParams.set('size', '128')
    const resp = await fetch(apiUrl.toString())
    if (!resp.ok) return null
    const blob = await resp.blob()
    if (blob.size === 0) return null
    return blobToDataURL(blob)
  } catch {
    return null
  }
}

/** 策略 C：尝试常见的 favicon 路径并获取 base64。
 *  需要授予泛域名主机权限（允许访问任意域名）。 */
async function fetchViaDirectUrls(pageUrl: string): Promise<string | null> {
  const candidates = [
    '/favicon.ico',
    '/favicon.png',
    '/favicon.svg',
    '/favicon.webp',
    '/apple-touch-icon.png',
  ]
  const { origin } = new URL(pageUrl)
  for (const path of candidates) {
    try {
      const resp = await fetch(origin + path, { signal: AbortSignal.timeout(5000) })
      if (!resp.ok) continue
      const contentType = resp.headers.get('content-type') ?? ''
      if (contentType.startsWith('text/') || contentType.includes('html')) continue
      const blob = await resp.blob()
      if (blob.size === 0) continue
      return blobToDataURL(blob)
    } catch {
      // 继续尝试下一个候选路径
    }
  }
  return null
}

/** 策略 D：通过 Image 元素探测常见路径（无需 CORS，仅返回 URL）。 */
async function probeViaImageElement(pageUrl: string): Promise<string | null> {
  const candidates = [
    '/favicon.ico',
    '/favicon.png',
    '/favicon.svg',
    '/favicon.webp',
    '/apple-touch-icon.png',
  ]
  const { origin } = new URL(pageUrl)
  for (const path of candidates) {
    const url = origin + path
    if (await probeImageUrl(url)) return url
  }
  return null
}

// ---------------------------------------------------------------------------
// 主要对外接口
// ---------------------------------------------------------------------------

/**
 * 返回 pageUrl 的 favicon，优先查询 L1（内存）→ L2（持久化）缓存。
 * 若命中但已过期，会在后台异步刷新并更新缓存；函数会立即返回当前（可能已过期或默认的）值，避免阻塞 UI。
 *
 * 返回值为 base64 数据 URL 或普通 URL（可通过前缀 'data:' 判断）。
 * 若完全不可用则返回 null（调用方应展示兜底图标）。
 */
export async function fetchFaviconWithCache(pageUrl: string): Promise<string | null> {
  const origin = toOrigin(pageUrl)
  if (!origin) return null

  // 缓存未启用：仅走 Strategy A/D，不读写 L1/L2，直接返回
  if (!_cacheEnabled) {
    let data: string | null = null
    if (import.meta.env.CHROME || import.meta.env.EDGE) {
      data = await fetchViaChromeFaviconApi(pageUrl)
    }
    if (!data) {
      data = await probeViaImageElement(pageUrl)
    }
    return data
  }

  // L1 hit
  const l1 = l1Cache.get(origin)
  if (l1) {
    const expired = Date.now() - l1.fetchedAt > FAVICON_CACHE_TTL
    if (!expired) return l1.data
    // 已过期 → 立即返回旧值，同时在后台刷新
    refreshInBackground(pageUrl, origin)
    return l1.data
  }

  // L2 hit
  const l2 = await getFaviconCacheEntry(origin)
  if (l2) {
    l1Cache.set(origin, l2)
    const expired = Date.now() - l2.fetchedAt > FAVICON_CACHE_TTL
    if (!expired) return l2.data
    refreshInBackground(pageUrl, origin)
    return l2.data
  }

  // 缓存未命中 → 立即抓取（已去重）
  return doFetch(pageUrl, origin)
}

/** 后台异步刷新（不等待结果） */
function refreshInBackground(pageUrl: string, origin: string): void {
  doFetch(pageUrl, origin).catch(() => {})
}

/** 对指定 origin 执行完整抓取（已去重）。 */
async function doFetch(pageUrl: string, origin: string): Promise<string | null> {
  // 去重处理
  const existing = pendingFetches.get(origin)
  if (existing) return existing

  const promise = (async (): Promise<string | null> => {
    let data: string | null = null
    let type: 'base64' | 'url' = 'base64'

    // 策略 A：Chromium 内部的 /_favicon/ API（不需要主机权限）
    if (import.meta.env.CHROME || import.meta.env.EDGE) {
      data = await fetchViaChromeFaviconApi(pageUrl)
    }

    // 策略 C：常见直接路径抓取（需要主机权限，适用于所有浏览器）
    if (!data) {
      const hasHostPerm = await browser.permissions
        .contains({ origins: ['*://*/*'] })
        .catch(() => false)

      if (hasHostPerm) {
        data = await fetchViaDirectUrls(pageUrl)
      }
    }

    // 策略 D：通过 Image 探测（无需 CORS，仅返回 URL）
    if (!data) {
      data = await probeViaImageElement(pageUrl)
      if (data) type = 'url'
    }

    if (data) {
      const entry: FaviconCacheEntry = { data, type, fetchedAt: Date.now() }
      // 始终保留到 L1（会话）；仅当该 origin 有引用时才持久化到 L2
      l1Cache.set(origin, entry)
      const refCount = refCounts.get(origin) ?? 0
      if (refCount > 0) {
        await setFaviconCacheEntry(origin, entry).catch(() => {})
      }
    }

    return data
  })()

  pendingFetches.set(origin, promise)
  try {
    return await promise
  } finally {
    pendingFetches.delete(origin)
  }
}

/**
 * 将已知 favicon 直接写入 L1/L2 缓存，跳过网络请求。
 * 若已有未过期条目则不做任何修改。
 * 常用于注入浏览器提供的 favicon（例如 Firefox 的 topSites）。
 */
export async function warmFaviconCache(
  pageUrl: string,
  faviconData: string,
  type: FaviconCacheEntry['type'] = 'url',
): Promise<void> {
  if (!_cacheEnabled) return
  const origin = toOrigin(pageUrl)
  if (!origin) return

  const l1 = l1Cache.get(origin)
  if (l1 && Date.now() - l1.fetchedAt <= FAVICON_CACHE_TTL) return
  const l2 = await getFaviconCacheEntry(origin)
  if (l2 && Date.now() - l2.fetchedAt <= FAVICON_CACHE_TTL) return

  const entry: FaviconCacheEntry = { data: faviconData, type, fetchedAt: Date.now() }
  l1Cache.set(origin, entry)
  await setFaviconCacheEntry(origin, entry).catch(() => {})
}

/** 增加 pageUrl 对应 origin 的引用计数。 */
export function acquireFaviconRef(pageUrl: string): void {
  if (!_cacheEnabled) return
  const origin = toOrigin(pageUrl)
  if (!origin) return

  // 取消该 origin 上任何挂起的清理定时器
  const timer = cleanupTimers.get(origin)
  if (timer) {
    clearTimeout(timer)
    cleanupTimers.delete(origin)
  }

  refCounts.set(origin, (refCounts.get(origin) ?? 0) + 1)
}

/**
 * 减少 pageUrl 对应 origin 的引用计数。
 * 当计数降为 0 时，会在短延迟后安排清理 L1/L2 缓存。
 * 若该 origin 有正在进行的抓取，会先等待抓取结束再执行最终删除。
 */
export function releaseFaviconRef(pageUrl: string): void {
  if (!_cacheEnabled) return
  const origin = toOrigin(pageUrl)
  if (!origin) return
  const next = (refCounts.get(origin) ?? 0) - 1
  if (next <= 0) {
    refCounts.delete(origin)

    // 安排延迟清理，避免与并发抓取或短暂的 UI 变化发生竞态
    const performCleanup = async () => {
      try {
        // 如果该 origin 有正在进行的抓取，先等待其完成
        const pending = pendingFetches.get(origin)
        if (pending) {
          await pending.catch(() => {})
        }

        // 若期间获取到新引用，则取消清理
        if ((refCounts.get(origin) ?? 0) > 0) return

        l1Cache.delete(origin)
        await deleteFaviconCacheEntry(origin).catch(() => {})
      } finally {
        cleanupTimers.delete(origin)
      }
    }

    const timer = setTimeout(performCleanup, CLEANUP_DELAY_MS)
    cleanupTimers.set(origin, timer)
  } else {
    refCounts.set(origin, next)
  }
}
