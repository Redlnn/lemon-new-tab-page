import { ElMessage } from 'element-plus'
import { h } from 'vue'

import { LocalExtensionStorage } from '@/newtab/js/storage'

async function getTopSites() {
  const topSites = await chrome.topSites.get()
  const blockedTopStites = await LocalExtensionStorage.getItem<string[]>('blockedTopStites', [])
  if (blockedTopStites.length <= 0) {
    return topSites
  }
  return topSites.filter(site => !blockedTopStites.includes(site.url))
}

async function blockSite(url: string, reloadFunc: () => Promise<void>) {
  const blockedTopStites = await LocalExtensionStorage.getItem<string[]>('blockedTopStites', [])
  if (blockedTopStites.includes(url)) {
    return
  }
  blockedTopStites.push(url)
  await LocalExtensionStorage.setItem('blockedTopStites', blockedTopStites)
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
            await LocalExtensionStorage.setItem('blockedTopStites', [])
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
  const blockedTopStites = await LocalExtensionStorage.getItem<string[]>('blockedTopStites', [])
  const index = blockedTopStites.indexOf(url)
  if (index > -1) {
    blockedTopStites.splice(index, 1)
    await LocalExtensionStorage.setItem('blockedTopStites', blockedTopStites)
  }
}

function getFaviconURL(url: string, size: string = '128') {
  const _url = new URL(chrome.runtime.getURL('/_favicon/'))
  _url.searchParams.set('pageUrl', encodeURI(url)) // this encodes the URL as well
  _url.searchParams.set('size', size)
  return _url.toString()
}

export { blockSite, getTopSites, getFaviconURL }
