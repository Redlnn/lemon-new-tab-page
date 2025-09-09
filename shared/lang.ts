import { browser } from 'wxt/browser'

export const lang = browser.i18n.getUILanguage()
export const isChinese = lang.startsWith('zh')
