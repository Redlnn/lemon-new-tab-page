import { defineStore } from 'pinia'

import { acquireFaviconRef } from '@/shared/media'

import {
  customSearchEngineStorage,
  type CustomSearchEngineStorage,
  defaultCustomSearchEngine,
} from './customSearchEngineStorage'

export const useCustomSearchEngineStore = defineStore('customSearchEngine', {
  state: () => {
    return structuredClone(defaultCustomSearchEngine)
  },

  actions: {
    async init() {
      const data = await customSearchEngineStorage.getValue()
      this.$patch(data)
      data.items.forEach((item) => acquireFaviconRef(item.url))
    },

    async save(data?: CustomSearchEngineStorage) {
      if (data) {
        this.$patch({ items: data.items })
      }
      const rawItems = toRaw(this.$state).items
      await customSearchEngineStorage.setValue({ items: rawItems })
    },
  },
})
