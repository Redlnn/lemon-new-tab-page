import type { Component } from 'vue'

import { i18n } from '@/.wxt/i18n'

import Baidu from '@/entrypoints/newtab/assets/baidu.svg?component'
import Bing from '@/entrypoints/newtab/assets/bing.svg?component'
import { Google } from '@vicons/fa'

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
    name: i18n.t('newtab.search_engine_menu.google'),
    url: 'https://www.google.com/search?q=%s',
    icon: Google
  },
  {
    name: i18n.t('newtab.search_engine_menu.baidu'),
    url: 'https://www.baidu.com/#ie=utf-8&wd=%s',
    icon: Baidu
  },
  {
    name: i18n.t('newtab.search_engine_menu.bing'),
    url: 'https://www.bing.com/search?q=%s',
    icon: Bing
  }
]

export const searchSuggestAPIs: Record<string, SearchSuggestAPI> = {
  google: { name: i18n.t('newtab.search_engine_menu.google'), parser: googleSuggestParser },
  baidu: { name: i18n.t('newtab.search_engine_menu.baidu'), parser: baiduSuggestParser },
  bing: { name: i18n.t('newtab.search_engine_menu.bing'), parser: bingSuggestParser }
}
