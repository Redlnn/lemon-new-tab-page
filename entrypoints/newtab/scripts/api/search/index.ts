import { useCustomSearchEngineStore } from '@/shared/customSearchEngine'

import Baidu from '@newtab/assets/baidu.svg?skipsvgo'
import Bing from '@newtab/assets/bing.svg?skipsvgo'
import DuckDuckGo from '@newtab/assets/duckduckgo.svg?skipsvgo'
import Google from '@newtab/assets/google.svg?skipsvgo'
import Yandex from '@newtab/assets/yandex.svg?skipsvgo'

import { baiduSuggestParser, bingSuggestParser, googleSuggestParser } from './suggestParser'

export const searchEngines = {
  google: {
    nameKey: 'newtab:searchEngineMenu.google',
    url: 'https://www.google.com/search?q=%s',
    icon: Google
  },
  baidu: {
    nameKey: 'newtab:searchEngineMenu.baidu',
    url: 'https://www.baidu.com/#ie=utf-8&wd=%s',
    icon: Baidu
  },
  bing: {
    nameKey: 'newtab:searchEngineMenu.bing',
    url: 'https://www.bing.com/search?q=%s',
    icon: Bing
  },
  yandex: {
    nameKey: 'newtab:searchEngineMenu.yandex',
    url: 'https://yandex.com/search?text=%s',
    icon: Yandex
  },
  duckduckgo: {
    nameKey: 'newtab:searchEngineMenu.duckduckgo',
    url: 'https://duckduckgo.com/?q=%s',
    icon: DuckDuckGo
  }
} as const

export const searchSuggestAPIs = {
  google: { nameKey: 'newtab:searchEngineMenu.google', parser: googleSuggestParser },
  baidu: { nameKey: 'newtab:searchEngineMenu.baidu', parser: baiduSuggestParser },
  bing: { nameKey: 'newtab:searchEngineMenu.bing', parser: bingSuggestParser }
} as const

/**
 * 获取搜索引擎的 URL（支持内置和自定义搜索引擎）
 * @param engineKey 搜索引擎键或自定义引擎 ID
 * @returns 搜索 URL 或 null
 */
export function getSearchEngineUrl(engineKey: string): string | null {
  // 优先检查内置搜索引擎
  if (engineKey in searchEngines) {
    return searchEngines[engineKey as keyof typeof searchEngines].url
  }

  // 检查自定义搜索引擎
  const customStore = useCustomSearchEngineStore()
  const customEngine = customStore.items.find((e) => e.id === engineKey)
  return customEngine?.url || null
}
