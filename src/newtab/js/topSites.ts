import browser from 'webextension-polyfill'
import { LocalExtensionStorage } from './storage'

async function getTopSites(slice?: number) {
  let topSites = await browser.topSites.get()
  const blockedTopStites = await LocalExtensionStorage.getItem<string[]>('blockedTopStites', [])
  if (blockedTopStites.length > 0) {
    topSites.forEach((site) => {
      if (blockedTopStites.includes(site.url)) {
        topSites = topSites.splice(topSites.indexOf(site), 1)
      }
    })
  }
  return topSites.slice(0, slice)
}

async function blockSite(url: string) {
  const blockedTopStites = await LocalExtensionStorage.getItem<string[]>('blockedTopStites', [])
  blockedTopStites.push(url)
  await LocalExtensionStorage.setItem('blockedTopStites', blockedTopStites)
}

function getFaviconURL(url: string, size: string = '128') {
  const _url = new URL(browser.runtime.getURL('/_favicon/'))
  _url.searchParams.set('pageUrl', url) // this encodes the URL as well
  _url.searchParams.set('size', size)
  return _url.toString()
}

export { blockSite, getTopSites, getFaviconURL }
