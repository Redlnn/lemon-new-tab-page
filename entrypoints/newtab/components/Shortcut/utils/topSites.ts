import i18next from 'i18next'
// 由于 wxt/browser 缺少火狐的 topSites 类型定义，直接用官方的 webextension-polyfill
import browser from 'webextension-polyfill'

import { blockedTopStitesStorage } from '@newtab/scripts/storages/topSitesStorage'

async function getTopSites() {
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
  showBlockedMessage(url, reloadFunc)
}

async function restoreBlockedSite(url: string) {
  const list = await blockedTopStitesStorage.getValue()
  const index = list.indexOf(url)
  if (index !== -1) {
    const next = list.slice()
    next.splice(index, 1)
    await blockedTopStitesStorage.setValue(next)
  }
}

function getFaviconURLChrome(url: string, size = '128') {
  const _url = new URL(chrome.runtime.getURL('/_favicon/'))
  _url.searchParams.set('pageUrl', encodeURI(url)) // 同时对 URL 本身进行编码
  _url.searchParams.set('size', size)
  return _url.toString()
}

export { blockSite, getFaviconURLChrome, getTopSites }
