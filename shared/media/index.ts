import type { Ref } from 'vue'
import { unref, watch } from 'vue'

export * from './verify'
export {
  acquireFaviconRef,
  cleanupFaviconCacheIfUnused,
  fetchFaviconWithCache,
  releaseFaviconRef,
  warmFaviconCache,
} from './faviconFetch'

import { fetchFaviconWithCache } from './faviconFetch'

export function getFaviconURL(url: string | Ref<string | null>): Ref<string> {
  const iconUrl = ref('/favicon.png')
  let seq = 0

  const resolve = (u: string | null | undefined) => {
    if (!u) {
      iconUrl.value = '/favicon.png'
      return
    }
    const currentSeq = ++seq
    iconUrl.value = '/favicon.png' // immediately reset to avoid stale icon on URL change

    fetchFaviconWithCache(u)
      .then((data) => {
        if (currentSeq === seq && data) iconUrl.value = data
      })
      .catch(() => {})
  }

  const initial = unref(url)
  resolve(initial)

  if (isRef(url)) {
    watch(url, (v) => resolve(v))
  }

  return iconUrl
}
