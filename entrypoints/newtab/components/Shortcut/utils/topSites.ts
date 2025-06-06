import browser from 'webextension-polyfill'
import { h } from 'vue'

import { blockedTopStitesStorage } from '@/newtab/scripts/storages/topSitesStorage'
import { i18n } from '@/.wxt/i18n'

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
  ElMessage({
    message: h('p', null, [
      h(
        'span',
        { style: { color: 'var(--el-color-success)' } },
        i18n.t('newtab.shortcut.removeTopMessage.content')
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
        i18n.t('newtab.shortcut.removeTopMessage.revoke')
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
        i18n.t('newtab.shortcut.removeTopMessage.restoreDefault')
      )
    ]),
    type: 'success'
  })
}

async function blockSite(url: string, reloadFunc: () => Promise<void>) {
  const blockedTopStites = await blockedTopStitesStorage.getValue()
  if (blockedTopStites.includes(url)) {
    return
  }
  blockedTopStites.push(url)
  await blockedTopStitesStorage.setValue(blockedTopStites)
  showBlockedMessage(url, reloadFunc)
}

async function restoreBlockedSite(url: string) {
  const blockedTopStites = new Set(await blockedTopStitesStorage.getValue())
  if (blockedTopStites.delete(url)) {
    await blockedTopStitesStorage.setValue(Array.from(blockedTopStites))
  }
}

function getFaviconURLChrome(url: string, size = '128') {
  const _url = new URL(chrome.runtime.getURL('/_favicon/'))
  _url.searchParams.set('pageUrl', encodeURI(url)) // this encodes the URL as well
  _url.searchParams.set('size', size)
  return _url.toString()
}

export { blockSite, getTopSites, getFaviconURLChrome }
