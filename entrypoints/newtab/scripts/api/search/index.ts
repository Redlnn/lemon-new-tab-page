import { Google } from '@vicons/fa'

import { t } from '@/shared/i18n'

import Baidu from '@newtab/assets/baidu.svg?component'
import Bing from '@newtab/assets/bing.svg?component'

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
  }
} as const

export const searchSuggestAPIs = {
  google: { name: t('newtab.searchEngineMenu.google'), parser: googleSuggestParser },
  baidu: { name: t('newtab.searchEngineMenu.baidu'), parser: baiduSuggestParser },
  bing: { name: t('newtab.searchEngineMenu.bing'), parser: bingSuggestParser }
} as const
