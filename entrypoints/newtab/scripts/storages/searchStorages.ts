import { storage } from 'wxt/storage'

export const searchHistoriesStorage = storage.defineItem<string[]>('local:searchHistories', {
  fallback: []
})
