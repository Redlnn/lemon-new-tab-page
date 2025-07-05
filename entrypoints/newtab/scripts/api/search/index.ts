import type { Component } from 'vue'

import { Google } from '@vicons/fa'

import { i18n } from '@/.wxt/i18n'
import Baidu from '@newtab/assets/baidu.svg?component'
import Bing from '@newtab/assets/bing.svg?component'

import { baiduSuggestParser, bingSuggestParser, googleSuggestParser } from './suggestParser'

interface SearchEngine {
  name: string
  url: string
  icon: Component
}

interface SearchSuggestAPI {
  name: string
  parser: (text: string) => Promise<string[]>
}

export const searchEngines: SearchEngine[] = [
  {
    name: i18n.t('newtab.searchEngineMenu.google'),
    url: 'https://www.google.com/search?q=%s',
    icon: Google
  },
  {
    name: i18n.t('newtab.searchEngineMenu.baidu'),
    url: 'https://www.baidu.com/#ie=utf-8&wd=%s',
    icon: Baidu
  },
  {
    name: i18n.t('newtab.searchEngineMenu.bing'),
    url: 'https://www.bing.com/search?q=%s',
    icon: Bing
  }
]

export const searchSuggestAPIs: Record<string, SearchSuggestAPI> = {
  google: { name: i18n.t('newtab.searchEngineMenu.google'), parser: googleSuggestParser },
  baidu: { name: i18n.t('newtab.searchEngineMenu.baidu'), parser: baiduSuggestParser },
  bing: { name: i18n.t('newtab.searchEngineMenu.bing'), parser: bingSuggestParser }
}
