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
// L1 in-memory cache (session lifetime)
// ---------------------------------------------------------------------------
const l1Cache = new Map<string, FaviconCacheEntry>()

// Deduplication: prevent multiple concurrent fetches for the same origin
const pendingFetches = new Map<string, Promise<string | null>>()

// ---------------------------------------------------------------------------
// Reference counting (session lifetime)
// ---------------------------------------------------------------------------
const refCounts = new Map<string, number>()
// Cleanup timers scheduled after refs drop to zero (avoid immediate L2 churn)
const cleanupTimers = new Map<string, ReturnType<typeof setTimeout>>()
// Delay before actually removing L1/L2 entries after last release (ms)
const CLEANUP_DELAY_MS = 10_000

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a Blob to a base64 data URL */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/** Extract the canonical origin from any URL string. Returns null if invalid. */
function toOrigin(url: string): string | null {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

/** Probe a URL using an HTMLImageElement (no CORS, display-only). */
function probeImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

// ---------------------------------------------------------------------------
// Fetch strategies
// ---------------------------------------------------------------------------

/** Strategy A: Chromium's internal /_favicon/ API → base64 */
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

/** Strategy C: Try well-known favicon paths, fetch each for base64.
 *  Requires `*:\/\/*` optional permission to be granted. */
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
      // continue to next candidate
    }
  }
  return null
}

/** Strategy D: Image-probe well-known paths (no CORS needed, URL-only result). */
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
// Main public API
// ---------------------------------------------------------------------------

/**
 * Return the favicon for `pageUrl`, consulting L1 → L2 caches first.
 * On cache miss (or expired entry), fetches in the background and updates
 * the cache; the stale / default value is returned immediately so the UI
 * is never blocked.
 *
 * Returns a base64 data URL or a plain URL string (prefix check: `data:`).
 * Returns `null` if completely unavailable (callers should show the fallback).
 */
export async function fetchFaviconWithCache(pageUrl: string): Promise<string | null> {
  const origin = toOrigin(pageUrl)
  if (!origin) return null

  // L1 hit
  const l1 = l1Cache.get(origin)
  if (l1) {
    const expired = Date.now() - l1.fetchedAt > FAVICON_CACHE_TTL
    if (!expired) return l1.data
    // Expired → return stale immediately, refresh in background
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

  // Cache miss → fetch now (with dedup)
  return doFetch(pageUrl, origin)
}

/** Fire-and-forget background refresh */
function refreshInBackground(pageUrl: string, origin: string): void {
  doFetch(pageUrl, origin).catch(() => {})
}

/** Perform a full fetch for `origin` (deduped). */
async function doFetch(pageUrl: string, origin: string): Promise<string | null> {
  // Deduplication
  const existing = pendingFetches.get(origin)
  if (existing) return existing

  const promise = (async (): Promise<string | null> => {
    let data: string | null = null
    let type: 'base64' | 'url' = 'base64'

    // Strategy A: Chromium's internal /_favicon/ API (no host permissions needed)
    if (import.meta.env.CHROME || import.meta.env.EDGE) {
      data = await fetchViaChromeFaviconApi(pageUrl)
    }

    // Strategy C: well-known direct fetch (needs host perms, works on all browsers)
    if (!data) {
      const hasHostPerm = await browser.permissions
        .contains({ origins: ['*://*/*'] })
        .catch(() => false)

      if (hasHostPerm) {
        data = await fetchViaDirectUrls(pageUrl)
      }
    }

    // Strategy D: image probe (no CORS, URL-only result)
    if (!data) {
      data = await probeViaImageElement(pageUrl)
      if (data) type = 'url'
    }

    if (data) {
      const entry: FaviconCacheEntry = { data, type, fetchedAt: Date.now() }
      // Always keep in L1 (session); persist to L2 only if someone holds a ref for this origin
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
 * Write a known favicon directly into L1 + L2 cache, skipping any network fetch.
 * A no-op if a non-expired entry already exists.
 * Useful for injecting browser-provided favicons (e.g. Firefox topSites).
 */
export async function warmFaviconCache(
  pageUrl: string,
  faviconData: string,
  type: FaviconCacheEntry['type'] = 'url',
): Promise<void> {
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

/** Increment the reference count for the origin of `pageUrl`. */
export function acquireFaviconRef(pageUrl: string): void {
  const origin = toOrigin(pageUrl)
  if (!origin) return

  // Cancel any pending cleanup for this origin
  const timer = cleanupTimers.get(origin)
  if (timer) {
    clearTimeout(timer)
    cleanupTimers.delete(origin)
  }

  refCounts.set(origin, (refCounts.get(origin) ?? 0) + 1)
}

/**
 * Decrement the reference count for the origin of `pageUrl`.
 * When it reaches zero, schedule L1/L2 cleanup after a short delay.
 * If a pending fetch is in progress, wait for it to finish before final deletion.
 */
export function releaseFaviconRef(pageUrl: string): void {
  const origin = toOrigin(pageUrl)
  if (!origin) return
  const next = (refCounts.get(origin) ?? 0) - 1
  if (next <= 0) {
    refCounts.delete(origin)

    // Schedule a delayed cleanup to avoid race with concurrent fetches or transient UI changes
    const performCleanup = async () => {
      try {
        // If a fetch is in progress for this origin, wait for it to complete
        const pending = pendingFetches.get(origin)
        if (pending) {
          await pending.catch(() => {})
        }

        // If a new ref was acquired meanwhile, abort cleanup
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

/**
 * Conditionally removes the favicon cache entry for `deletedUrl`'s origin
 * only when no other URL in `activeUrls` shares that origin.
 *
 * @deprecated Use `acquireFaviconRef` / `releaseFaviconRef` instead.
 */
export async function cleanupFaviconCacheIfUnused(
  deletedUrl: string,
  activeUrls: string[],
): Promise<void> {
  const deletedOrigin = toOrigin(deletedUrl)
  if (!deletedOrigin) return

  const stillUsed = activeUrls.some((u) => toOrigin(u) === deletedOrigin)
  if (stillUsed) return

  l1Cache.delete(deletedOrigin)
  await deleteFaviconCacheEntry(deletedOrigin)
}
