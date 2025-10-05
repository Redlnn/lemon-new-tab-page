import i18next from 'i18next'
import { browser } from 'wxt/browser'

export const lang = i18next.language || browser.i18n.getUILanguage()
export const isChinese = lang.startsWith('zh')
