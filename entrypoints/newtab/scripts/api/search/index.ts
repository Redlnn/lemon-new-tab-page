import { Google } from '@vicons/fa'

import { i18n } from '@/.wxt/i18n'

import Baidu from '@newtab/assets/baidu.svg?component'
import Bing from '@newtab/assets/bing.svg?component'

import { baiduSuggestParser, bingSuggestParser, googleSuggestParser } from './suggestParser'

export const searchEngines = {
  google: {
    name: i18n.t('newtab.searchEngineMenu.google'),
    url: 'https://www.google.com/search?q=%s',
    icon: Google
  },
  baidu: {
    name: i18n.t('newtab.searchEngineMenu.baidu'),
    url: 'https://www.baidu.com/#ie=utf-8&wd=%s',
    icon: Baidu
  },
  bing: {
    name: i18n.t('newtab.searchEngineMenu.bing'),
    url: 'https://www.bing.com/search?q=%s',
    icon: Bing
  }
} as const

export const searchSuggestAPIs = {
  google: { name: i18n.t('newtab.searchEngineMenu.google'), parser: googleSuggestParser },
  baidu: { name: i18n.t('newtab.searchEngineMenu.baidu'), parser: baiduSuggestParser },
  bing: { name: i18n.t('newtab.searchEngineMenu.bing'), parser: bingSuggestParser }
} as const
