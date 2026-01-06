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

export async function saveCustomSearchEngine(
  data: CustomSearchEngineStorage | { $state?: CustomSearchEngineStorage }
) {
  let toSave: CustomSearchEngineStorage | undefined

  if (!data) {
    toSave = useCustomSearchEngineStore().$state
  } else if ((data as unknown as { $state?: CustomSearchEngineStorage }).$state) {
    toSave = (data as unknown as { $state?: CustomSearchEngineStorage }).$state
  } else {
    toSave = data as CustomSearchEngineStorage
  }

  const rawItems = toRaw(toSave as CustomSearchEngineStorage).items
  await customSearchEngineStorage.setValue({ items: rawItems })
}

export const useCustomSearchEngineStore = defineStore('customSearchEngine', {
  state: () => {
    return structuredClone(defaultCustomSearchEngine)
  }
})
