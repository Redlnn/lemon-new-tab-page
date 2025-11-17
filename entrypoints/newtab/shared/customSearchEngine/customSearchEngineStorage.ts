import { storage } from '#imports'

interface CustomSearchEngine {
  id: string
  name: string
  url: string
  icon?: string
}

export interface CustomSearchEngineStorage {
  items: CustomSearchEngine[]
}

export const defaultCustomSearchEngine: CustomSearchEngineStorage = { items: [] }

export const customSearchEngineStorage = storage.defineItem<CustomSearchEngineStorage>(
  'local:customSearchEngine',
  {
    fallback: structuredClone(defaultCustomSearchEngine)
  }
)
