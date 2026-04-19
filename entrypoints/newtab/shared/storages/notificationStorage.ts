import { storage } from '#imports'

/** 是否已向用户展示过图标缓存提示通知（仅展示一次） */
export const shownFaviconCacheHintStorage = storage.defineItem<boolean>(
  'local:shownFaviconCacheHint',
  { fallback: false },
)
