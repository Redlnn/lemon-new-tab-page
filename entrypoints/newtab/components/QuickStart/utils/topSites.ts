import { ElMessage } from 'element-plus'
import { browser } from 'wxt/browser'
import { h } from 'vue'

import { blockedTopStitesStorage } from '@/entrypoints/newtab/js/store/topSitesStore'

async function getTopSites() {
  let topSites
  if (import.meta.env.BROWSER === 'chrome') {
    topSites = await browser.topSites.get()
  } else if (import.meta.env.BROWSER === 'firefox'){
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
      h('span', { style: { color: 'var(--el-color-success)' } }, '已移除快捷方式'),
      h(
        'span',
        {
          style: { marginLeft: '20px', color: 'var(--el-color-primary)', cursor: 'pointer' },
          onClick: async () => {
            await restoreBlockedSite(url)
            await reloadFunc()
          }
        },
        '撤销'
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
        '恢复默认快捷方式'
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

function getFaviconURLChrome(url: string, size: string = '128') {
  const _url = new URL(chrome.runtime.getURL('/_favicon/'))
  _url.searchParams.set('pageUrl', encodeURI(url)) // this encodes the URL as well
  _url.searchParams.set('size', size)
  return _url.toString()
}

export { blockSite, getTopSites, getFaviconURLChrome }
