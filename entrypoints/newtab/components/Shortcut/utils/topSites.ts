import i18next from 'i18next'
// 由于 wxt/browser 缺少火狐的 topSites 类型定义，直接用官方的 webextension-polyfill
import type { TopSites } from 'webextension-polyfill'
import browser from 'webextension-polyfill'

import {
  acquireFaviconRef,
  fetchFaviconWithCache,
  releaseFaviconRef,
  warmFaviconCache,
} from '@/shared/media'
import { blockedTopSitesStorage } from '@newtab/shared/storages/topSitesStorage'

const TOP_SITES_TTL = 30_000 // 30 秒
let cachedTopSites: { value: TopSites.MostVisitedURL[]; ts: number } | null = null
let pendingTopSitesPromise: Promise<TopSites.MostVisitedURL[]> | null = null

function shouldUseCache(force = false) {
  if (force) return false
  if (!cachedTopSites) return false
  return Date.now() - cachedTopSites.ts <= TOP_SITES_TTL
}

async function cacheBrowserFavicons(sites: TopSites.MostVisitedURL[]): Promise<void> {
  // Firefox 可能会直接返回 favicon；预热缓存以便在列表旋转时仍能保留它们。
  // 对于没有 favicon 的站点，触发后台获取。
  const tasks = sites
    .filter((s) => s.url)
    .map(async (s) => {
      if (s.favicon) {
        await warmFaviconCache(s.url, s.favicon, 'url').catch(() => {})
      } else {
        await fetchFaviconWithCache(s.url).catch(() => {})
      }
    })
  await Promise.allSettled(tasks)
}

async function fetchTopSites(): Promise<TopSites.MostVisitedURL[]> {
  let topSites
  if (import.meta.env.CHROME || import.meta.env.EDGE) {
    topSites = await browser.topSites.get()
  } else if (import.meta.env.FIREFOX) {
    topSites = await browser.topSites.get({ includeFavicon: true })
    // 在后台缓存 Firefox 提供的 favicon（不阻塞渲染）
    cacheBrowserFavicons(topSites).catch(() => {})
  } else {
    throw new Error('Unsupported browser')
  }
  const blockedTopStites = new Set(await blockedTopSitesStorage.getValue())
  return topSites.filter((site) => !blockedTopStites.has(site.url))
}

async function getTopSites(force = false): Promise<TopSites.MostVisitedURL[]> {
  if (shouldUseCache(force)) {
    return cachedTopSites!.value
  }

  if (pendingTopSitesPromise && !force) {
    return pendingTopSitesPromise
  }

  pendingTopSitesPromise = fetchTopSites()

  try {
    const previousUrls = cachedTopSites?.value.map((s) => s.url) ?? []
    const value = await pendingTopSitesPromise
    const newUrls = value.map((s) => s.url)

    // Update reference counts: acquire for newly appeared sites, release for disappeared ones
    const disappeared = previousUrls.filter((u) => !newUrls.includes(u))
    const appeared = newUrls.filter((u) => !previousUrls.includes(u))
    disappeared.forEach((u) => releaseFaviconRef(u))
    appeared.forEach((u) => acquireFaviconRef(u))

    cachedTopSites = { value, ts: Date.now() }
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
