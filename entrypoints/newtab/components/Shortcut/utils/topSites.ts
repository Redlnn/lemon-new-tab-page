import i18next from 'i18next'
// 由于 wxt/browser 缺少火狐的 topSites 类型定义，直接用官方的 webextension-polyfill
import type { TopSites } from 'webextension-polyfill'
import browser from 'webextension-polyfill'

import { getFaviconURLChrome } from '@/shared/media'

import { topSitesIconCacheStorage } from '@newtab/shared/storages/topSitesIconCacheStorage'
import { blockedTopSitesStorage } from '@newtab/shared/storages/topSitesStorage'

const TOP_SITES_TTL = 30_000 // 30 秒
let cachedTopSites: { value: TopSites.MostVisitedURL[]; ts: number } | null = null
let pendingTopSitesPromise: Promise<TopSites.MostVisitedURL[]> | null = null

function shouldUseCache(force = false) {
  if (force) return false
  if (!cachedTopSites) return false
  return Date.now() - cachedTopSites.ts <= TOP_SITES_TTL
}

async function fetchFaviconAsBase64(pageUrl: string): Promise<string | null> {
  try {
    let faviconUrl: string | null = null
    if (import.meta.env.CHROME || import.meta.env.EDGE) {
      faviconUrl = getFaviconURLChrome(pageUrl)
    } else {
      // browser.topSites.get({ includeFavicon: true }) 不一定靠谱
      // 直接使用 pageUrl 的 origin + /favicon.ico 作为后续 fetch 的 URL
      faviconUrl = new URL('/favicon.ico', pageUrl).toString()
    }

    const response = await fetch(faviconUrl)
    const blob = await response.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function fetchAndCacheIcons(
  sites: TopSites.MostVisitedURL[],
  cache: Record<string, string>,
): Promise<void> {
  let changed = false
  for (const site of sites) {
    // Firefox 已有 favicon data URI
    if (site.favicon) {
      cache[site.url] = site.favicon
      changed = true
      continue
    }
    const base64 = await fetchFaviconAsBase64(site.url)
    if (base64) {
      cache[site.url] = base64
      site.favicon = base64
      changed = true
    } else {
      // 获取失败的站点使用默认图标
      // 但不缓存，下一次仍然尝试获取（可能是临时的网络问题导致获取失败）
      // 避免渲染时再次尝试获取
      site.favicon = '/favicon.png'
    }
  }
  if (changed) {
    await topSitesIconCacheStorage.setValue(cache)
  }
}

async function enrichWithCachedIcons(sites: TopSites.MostVisitedURL[]): Promise<void> {
  const cache = await topSitesIconCacheStorage.getValue()
  const currentUrls = new Set<string>()

  for (const site of sites) {
    currentUrls.add(site.url)
    if (cache[site.url]) {
      site.favicon = cache[site.url]
    }
  }

  // 裁剪不再出现的 URL
  let changed = false
  for (const url of Object.keys(cache)) {
    if (!currentUrls.has(url)) {
      delete cache[url]
      changed = true
    }
  }

  // 后台获取缓存未命中的图标（不阻塞渲染）
  const missing = sites.filter((s) => !cache[s.url])
  if (missing.length > 0) {
    fetchAndCacheIcons(missing, cache)
  } else if (changed) {
    topSitesIconCacheStorage.setValue(cache)
  }
}

async function fetchTopSites(): Promise<TopSites.MostVisitedURL[]> {
  let topSites
  if (import.meta.env.FIREFOX) {
    topSites = await browser.topSites.get({ includeFavicon: true })
  } else {
    topSites = await browser.topSites.get()
  }
  const blockedTopStites = new Set(await blockedTopSitesStorage.getValue())
  return topSites.filter((site) => !blockedTopStites.has(site.url))
}

async function getTopSites(force = false, cacheIcons = false): Promise<TopSites.MostVisitedURL[]> {
  if (shouldUseCache(force)) {
    return cachedTopSites!.value
  }

  if (pendingTopSitesPromise && !force) {
    return pendingTopSitesPromise
  }

  pendingTopSitesPromise = fetchTopSites()

  try {
    const value = await pendingTopSitesPromise
    cachedTopSites = { value, ts: Date.now() }

    if (cacheIcons) {
      await enrichWithCachedIcons(value)
    }

    return value
  } finally {
    pendingTopSitesPromise = null
  }
}

function invalidateTopSitesCache() {
  cachedTopSites = null
}

function showBlockedMessage(url: string, reloadFunc: () => Promise<void>) {
  ElMessage.success({
    message: h('p', null, [
      h(
        'span',
        { style: { color: 'var(--el-color-success)' } },
        i18next.t('newtab:shortcut.hideTopMessage.content'),
      ),
      h(
        'span',
        {
          style: { marginLeft: '20px', color: 'var(--el-color-primary)', cursor: 'pointer' },
          onClick: async () => {
            await restoreBlockedSite(url)
            await reloadFunc()
          },
        },
        i18next.t('newtab:common.undo'),
      ),
      h(
        'span',
        {
          style: { marginLeft: '20px', color: 'var(--el-color-primary)', cursor: 'pointer' },
          onClick: async () => {
            invalidateTopSitesCache()
            await blockedTopSitesStorage.setValue([])
            await reloadFunc()
            ElMessage.success({
              message: i18next.t('newtab:shortcut.hideTopMessage.restoreSuccess'),
            })
          },
        },
        i18next.t('newtab:shortcut.hideTopMessage.restoreDefault'),
      ),
    ]),
  })
}

async function blockSite(url: string, reloadFunc: () => Promise<void>) {
  const list = await blockedTopSitesStorage.getValue()
  if (list.includes(url)) {
    return
  }
  await blockedTopSitesStorage.setValue([...list, url])
  invalidateTopSitesCache()
  showBlockedMessage(url, reloadFunc)
}

async function restoreBlockedSite(url: string) {
  const list = await blockedTopSitesStorage.getValue()
  const index = list.indexOf(url)
  if (index !== -1) {
    const next = list.slice()
    next.splice(index, 1)
    await blockedTopSitesStorage.setValue(next)
    invalidateTopSitesCache()
  }
}

export { blockSite, getTopSites, invalidateTopSitesCache }
