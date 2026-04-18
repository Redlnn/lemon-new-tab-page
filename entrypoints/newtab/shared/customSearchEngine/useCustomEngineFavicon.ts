// entrypoints/newtab/shared/customSearchEngine/useCustomEngineFavicon.ts
import type { Ref } from 'vue'

import { getFaviconURL } from '@/shared/media'

interface CustomEngine {
  id: string
  url: string
  icon?: string
}

/**
 * Returns a stable composable for resolving custom search engine favicons.
 * Call once per component; the returned `getCustomEngineFavicon` function is
 * safe to use in templates.
 */
export function useCustomEngineFavicon() {
  const faviconRefMap = new Map<string, Ref<string>>()

  function getCustomEngineFavicon(engine: CustomEngine): string {
    if (engine.icon) return engine.icon

    const key = `${engine.id}:${engine.url}`
    if (!faviconRefMap.has(key)) {
      faviconRefMap.set(key, getFaviconURL(engine.url))
    }
    return faviconRefMap.get(key)!.value
  }

  return { getCustomEngineFavicon }
}
