import { t } from '@/shared/i18n'

import Baidu from '@newtab/assets/baidu.svg?skipsvgo'
import Bing from '@newtab/assets/bing.svg?skipsvgo'
import DuckDuckGo from '@newtab/assets/duckduckgo.svg?skipsvgo'
import Google from '@newtab/assets/google.svg?skipsvgo'
import Yandex from '@newtab/assets/yandex.svg?skipsvgo'

import { baiduSuggestParser, bingSuggestParser, googleSuggestParser } from './suggestParser'

export const searchEngines = {
  google: {
    name: t('newtab.searchEngineMenu.google'),
    url: 'https://www.google.com/search?q=%s',
    icon: Google
  },
  baidu: {
    name: t('newtab.searchEngineMenu.baidu'),
    url: 'https://www.baidu.com/#ie=utf-8&wd=%s',
    icon: Baidu
  },
  bing: {
    name: t('newtab.searchEngineMenu.bing'),
    url: 'https://www.bing.com/search?q=%s',
    icon: Bing
  },
  yandex: {
    name: t('newtab.searchEngineMenu.yandex'),
    url: 'https://yandex.com/search?text=%s',
    icon: Yandex
  },
  duckduckgo: {
    name: t('newtab.searchEngineMenu.duckduckgo'),
    url: 'https://duckduckgo.com/?q=%s',
    icon: DuckDuckGo
  }
} as const

export const searchSuggestAPIs = {
  google: { name: t('newtab.searchEngineMenu.google'), parser: googleSuggestParser },
  baidu: { name: t('newtab.searchEngineMenu.baidu'), parser: baiduSuggestParser },
  bing: { name: t('newtab.searchEngineMenu.bing'), parser: bingSuggestParser }
} as const
