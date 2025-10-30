import { defineStore } from 'pinia'

import {
  customSearchEngineStorage,
  type CustomSearchEngineStorage,
  defaultCustomSearchEngine
} from './customSearchEngineStorage'

export async function initCustomSearchEngine() {
  const data = await customSearchEngineStorage.getValue()
  const customSearchEngineStore = useCustomSearchEngineStore()
  customSearchEngineStore.$patch(data)
}

export async function saveCustomSearchEngine(data: CustomSearchEngineStorage) {
  const rawItems = data.items.map((item) => toRaw(item))
  await customSearchEngineStorage.setValue({ items: rawItems })
}

export const useCustomSearchEngineStore = defineStore('customSearchEngine', {
  state: () => {
    return structuredClone(defaultCustomSearchEngine)
  }
})
