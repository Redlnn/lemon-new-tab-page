import { ElMessage } from 'element-plus'
import { browser } from 'wxt/browser'
import { h } from 'vue'

import { blockedTopStitesStorage } from '@/newtab/scripts/store/topSitesStore'
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
  const blockedTopStites = await blockedTopStitesStorage.getValue()
  if (blockedTopStites.length <= 0) {
    return topSites
  }
  return topSites.filter((site) => !blockedTopStites.includes(site.url))
}

async function blockSite(url: string, reloadFunc: () => Promise<void>) {
  const blockedTopStites = await blockedTopStitesStorage.getValue()
  if (blockedTopStites.includes(url)) {
    return
  }
  blockedTopStites.push(url)
  await blockedTopStitesStorage.setValue(blockedTopStites)
  ElMessage({
    message: h('p', null, [
      h(
        'span',
        { style: { color: 'var(--el-color-success)' } },
        i18n.t('newtab.quickstart.removeTopMessage.content')
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
        i18n.t('newtab.quickstart.removeTopMessage.revoke')
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
        i18n.t('newtab.quickstart.removeTopMessage.restoreDefault')
      )
    ]),
    type: 'success'
  })
}

async function restoreBlockedSite(url: string) {
  const blockedTopStites = await blockedTopStitesStorage.getValue()
  const index = blockedTopStites.indexOf(url)
  if (index > -1) {
    blockedTopStites.splice(index, 1)
    await blockedTopStitesStorage.setValue(blockedTopStites)
  }
}

function getFaviconURLChrome(url: string, size = '128') {
  const _url = new URL(chrome.runtime.getURL('/_favicon/'))
  _url.searchParams.set('pageUrl', encodeURI(url)) // this encodes the URL as well
  _url.searchParams.set('size', size)
  return _url.toString()
}

export { blockSite, getTopSites, getFaviconURLChrome }
