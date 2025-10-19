import i18next from 'i18next'
// 由于 wxt/browser 缺少火狐的 topSites 类型定义，直接用官方的 webextension-polyfill
import type { TopSites } from 'webextension-polyfill'
import browser from 'webextension-polyfill'

import { blockedTopStitesStorage } from '@newtab/scripts/storages/topSitesStorage'

const TOP_SITES_TTL = 30_000 // 30 秒
let cachedTopSites: { value: TopSites.MostVisitedURL[]; ts: number } | null = null
let pendingTopSitesPromise: Promise<TopSites.MostVisitedURL[]> | null = null

function shouldUseCache(force = false) {
  if (force) return false
  if (!cachedTopSites) return false
  return Date.now() - cachedTopSites.ts <= TOP_SITES_TTL
}

async function fetchTopSites(): Promise<TopSites.MostVisitedURL[]> {
  let topSites
  if (import.meta.env.CHROME || import.meta.env.EDGE) {
    topSites = await browser.topSites.get()
  } else if (import.meta.env.FIREFOX) {
    topSites = await browser.topSites.get({ includeFavicon: true })
  } else {
    throw new Error('Unsupported browser')
  }
  const blockedTopStites = new Set(await blockedTopStitesStorage.getValue())
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
    const value = await pendingTopSitesPromise
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
        i18next.t('newtab:shortcut.removeTopMessage.content')
      ),
      h(
        'span',
        {
          style: { marginLeft: '20px', color: 'var(--el-color-primary)', cursor: 'pointer' },
          onClick: async () => {
            await restoreBlockedSite(url)
            await reloadFunc()
          }
        },
        i18next.t('newtab:shortcut.removeTopMessage.revoke')
      ),
      h(
        'span',
        {
          style: { marginLeft: '20px', color: 'var(--el-color-primary)', cursor: 'pointer' },
          onClick: async () => {
            invalidateTopSitesCache()
            await blockedTopStitesStorage.setValue([])
            await reloadFunc()
          }
        },
        i18next.t('newtab:shortcut.removeTopMessage.restoreDefault')
      )
    ])
  })
}

async function blockSite(url: string, reloadFunc: () => Promise<void>) {
  const list = await blockedTopStitesStorage.getValue()
  if (list.includes(url)) {
    return
  }
  await blockedTopStitesStorage.setValue([...list, url])
  invalidateTopSitesCache()
  showBlockedMessage(url, reloadFunc)
}

async function restoreBlockedSite(url: string) {
  const list = await blockedTopStitesStorage.getValue()
  const index = list.indexOf(url)
  if (index !== -1) {
    const next = list.slice()
    next.splice(index, 1)
    await blockedTopStitesStorage.setValue(next)
    invalidateTopSitesCache()
  }
}

function getFaviconURLChrome(url: string, size = '128') {
  const _url = new URL(chrome.runtime.getURL('/_favicon/'))
  _url.searchParams.set('pageUrl', encodeURI(url)) // 同时对 URL 本身进行编码
  _url.searchParams.set('size', size)
  return _url.toString()
}

export { blockSite, getFaviconURLChrome, getTopSites, invalidateTopSitesCache }
