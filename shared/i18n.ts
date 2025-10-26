import type { App } from 'vue'

import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import I18NextVue from 'i18next-vue'

function isHKorMO() {
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions()
  if (timeZone === 'Asia/Hong_Kong' || timeZone === 'Asia/Macau') {
    return true
  }
  return false
}

function changeDocument() {
  document.documentElement.lang = i18next.language
  document.title = i18next.t('newtab:title')
}

const languageDetector = new LanguageDetector(null, {
  order: ['localStorage', 'navigator'],
  caches: ['localStorage']
})

export const i18nInitPromise = i18next
  // 检测用户语言
  // 参考: https://github.com/i18next/i18next-browser-languageDetector
  .use(languageDetector)
  .use(resourcesToBackend((lng: string, ns: string) => import(`@/locales/${lng}/${ns}.json`)))
  .init({
    fallbackLng: {
      'zh-MO': ['zh-HK'],
      zh: ['zh-CN'],
      default: ['en']
    },
    load: 'currentOnly',
    nonExplicitSupportedLngs: true,
    ns: ['newtab', 'settings', 'sync', 'faq'],
    defaultNS: 'newtab',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false
    }
  })
  .then(() => {
    // Windows 不能正确区分 zh-HK 和 zh-TW，把所有繁体中文都当作 zh-TW
    if (i18next.language === 'zh-TW' && isHKorMO()) {
      i18next.changeLanguage('zh-HK')
    }
  })
  .then(() => {
    changeDocument()
    // 同步 UI：当语言变化时，更新 <html lang> 与标题
    i18next.on('languageChanged', changeDocument)
  })

export const i18n = <T extends App>(app: T) => {
  app.use(I18NextVue, { i18next })
  return app
}
