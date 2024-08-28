import type { Component } from 'vue'

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
  [text: string]: (text: string) => Promise<string[]>
}

export const searchEngines: SearchEngine[] = [
  {
    name: '必应',
    url: 'https://www.bing.com/search?q=%s',
    icon: Bing
  },
  {
    name: '百度',
    url: 'https://www.baidu.com/#ie=utf-8&wd=%s',
    icon: Baidu
  },
  {
    name: '谷歌',
    url: 'https://www.google.com/search?q=%s',
    icon: Google
  }
]

export const searchSuggestAPIs: SearchSuggestAPI = {
  必应: bingSuggestParser,
  百度: baiduSuggestParser,
  谷歌: googleSuggestParser
}
