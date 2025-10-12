import i18next from 'i18next'
import { browser } from 'wxt/browser'

export const getLang = () => i18next.language || browser.i18n.getUILanguage()
export const isChinese = computed(() => getLang().startsWith('zh'))
