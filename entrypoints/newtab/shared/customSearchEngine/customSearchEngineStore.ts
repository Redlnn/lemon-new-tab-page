import { defineStore } from 'pinia'

import { acquireFaviconRef } from '@/shared/media'

import {
  customSearchEngineStorage,
  type CustomSearchEngineStorage,
  defaultCustomSearchEngine,
} from './customSearchEngineStorage'

export const useCustomSearchEngineStore = defineStore('customSearchEngine', () => {
  const items = ref(structuredClone(defaultCustomSearchEngine.items))

  const init = async () => {
    const data = await customSearchEngineStorage.getValue()
    items.value = data.items
    data.items.forEach((item) => acquireFaviconRef(item.url))
  }

  const save = async (data?: CustomSearchEngineStorage) => {
    if (data) {
      items.value = data.items
    }
    await customSearchEngineStorage.setValue({ items: toRaw(items.value) })
  }

  return { items, init, save }
})
