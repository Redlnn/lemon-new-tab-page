import i18next from 'i18next'

import Baidu from '@newtab/assets/baidu.svg?skipsvgo'
import Bing from '@newtab/assets/bing.svg?skipsvgo'
import DuckDuckGo from '@newtab/assets/duckduckgo.svg?skipsvgo'
import Google from '@newtab/assets/google.svg?skipsvgo'
import Yandex from '@newtab/assets/yandex.svg?skipsvgo'

import { baiduSuggestParser, bingSuggestParser, googleSuggestParser } from './suggestParser'

export const searchEngines = {
  google: {
    name: i18next.t('newtab:searchEngineMenu.google'),
    url: 'https://www.google.com/search?q=%s',
    icon: Google
  },
  baidu: {
    name: i18next.t('newtab:searchEngineMenu.baidu'),
    url: 'https://www.baidu.com/#ie=utf-8&wd=%s',
    icon: Baidu
  },
  bing: {
    name: i18next.t('newtab:searchEngineMenu.bing'),
    url: 'https://www.bing.com/search?q=%s',
    icon: Bing
  },
  yandex: {
    name: i18next.t('newtab:searchEngineMenu.yandex'),
    url: 'https://yandex.com/search?text=%s',
    icon: Yandex
  },
  duckduckgo: {
    name: i18next.t('newtab:searchEngineMenu.duckduckgo'),
    url: 'https://duckduckgo.com/?q=%s',
    icon: DuckDuckGo
  }
}

export const searchSuggestAPIs = {
  google: { name: i18next.t('newtab:searchEngineMenu.google'), parser: googleSuggestParser },
  baidu: { name: i18next.t('newtab:searchEngineMenu.baidu'), parser: baiduSuggestParser },
  bing: { name: i18next.t('newtab:searchEngineMenu.bing'), parser: bingSuggestParser }
}
