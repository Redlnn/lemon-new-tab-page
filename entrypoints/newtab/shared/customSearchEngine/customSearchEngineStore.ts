import { defineStore } from 'pinia'

import { acquireFaviconRef } from '@/shared/media'

import {
  customSearchEngineStorage,
  type CustomSearchEngineStorage,
  defaultCustomSearchEngine,
} from './customSearchEngineStorage'

export const useCustomSearchEngineStore = defineStore('customSearchEngine', () => {
  const items = ref(structuredClone(defaultCustomSearchEngine.items))

  async function init() {
    const data = await customSearchEngineStorage.getValue()
    items.value = data.items
    data.items.forEach((item) => acquireFaviconRef(item.url))
  }

  async function save(data?: CustomSearchEngineStorage) {
    if (data) {
      items.value = data.items
    }
    await customSearchEngineStorage.setValue({ items: toRaw(items.value) })
  }

  return { items, init, save }
})
