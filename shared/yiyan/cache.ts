import { storage } from '#imports'
import type { YiyanProviderKey, YiyanResult } from './providers'

type YiyanCache = {
  provider: YiyanProviderKey
  res: YiyanResult
  ts: number
}

// use session driver via storage.defineItem
const KEY = 'session:lemon:yiyan:cache'
const TTL = 10 * 1000 // 10 seconds

const yiyanCacheStorage = storage.defineItem<YiyanCache | null>(KEY, {
  fallback: null
})

export async function getYiyanCache(): Promise<YiyanCache | null> {
  try {
    return await yiyanCacheStorage.getValue()
  } catch {
    return null
  }
}

export async function setYiyanCache(provider: YiyanProviderKey, res: YiyanResult): Promise<void> {
  const payload: YiyanCache = {
    provider,
    res: res,
    ts: Date.now()
  }
  try {
    await yiyanCacheStorage.setValue(payload)
  } catch (err) {
    console.error('setYiyanCache error', err)
  }
}

export function isCacheFresh(cache: YiyanCache | null): boolean {
  if (!cache) {
    return false
  }
  return Date.now() - cache.ts <= TTL
}
