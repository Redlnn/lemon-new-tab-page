import type { Ref } from 'vue'
import { unref, watch } from 'vue'

export * from './verify'

export function getFaviconURLChrome(url: string, size = '128') {
  const _url = new URL(chrome.runtime.getURL('/_favicon/'))
  _url.searchParams.set('pageUrl', encodeURI(url)) // 同时对 URL 本身进行编码
  _url.searchParams.set('size', size)
  return _url.toString()
}

export function getFaviconURL(url: string | Ref<string | null>): Ref<string> {
  const iconUrl = ref('/favicon.png')
  let img: HTMLImageElement | null = null

  const resolve = (u: string | null | undefined) => {
    if (!u) {
      iconUrl.value = '/favicon.png'
      return
    }

    if (import.meta.env.CHROME || import.meta.env.EDGE) {
      iconUrl.value = getFaviconURLChrome(u)
      return
    }

    // browser.topSites.get({ includeFavicon: true }) 不一定靠谱
    // 直接使用 pageUrl 的 origin + /favicon.ico 作为后续 fetch 的 URL
    const primary = new URL('/favicon.ico', u).toString()

    if (img) {
      img.onload = null
      img.onerror = null
    }

    img = new Image()
    img.onload = () => (iconUrl.value = primary)
    img.onerror = () => (iconUrl.value = '/favicon.png')
    img.src = primary
  }

  // 支持传入普通字符串或 Ref
  const initial = unref(url)
  resolve(initial)

  if (isRef(url)) {
    watch(url, (v) => {
      resolve(v)
    })
  }

  return iconUrl
}
