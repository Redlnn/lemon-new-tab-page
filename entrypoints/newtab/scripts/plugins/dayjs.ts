import { PluginLunar } from 'dayjs-plugin-lunar'
import type { PluginFunc } from 'dayjs/esm'
import dayjs from 'dayjs/esm'
import localizedFormat from 'dayjs/esm/plugin/localizedFormat'
import i18next from 'i18next'

import { getLang } from '@/shared/lang'

const dayjsZhLocales = import.meta.glob('/node_modules/dayjs/esm/locale/zh*.js') as Record<
  string,
  () => Promise<{ default: ILocale }>
>

dayjs.extend(localizedFormat)
dayjs.extend(PluginLunar as PluginFunc<{ traditional?: boolean }>)

const changeLanguage = async (lng: string) => {
  if (lng?.startsWith('zh')) {
    const language = lng.toLowerCase()
    const loader = dayjsZhLocales[`/node_modules/dayjs/esm/locale/${language}.js`]
    const fallback = dayjsZhLocales['/node_modules/dayjs/esm/locale/zh-cn.js']!
    const mod = loader ? await loader() : await fallback()
    const localeData = mod.default
    if (localeData?.name) {
      dayjs.locale(localeData)
    }
  }
}

export const initDayjs = async () => {
  const lang = getLang()
  await changeLanguage(lang)

  // 当语言切换时，同步 dayjs 语言
  i18next.on('languageChanged', changeLanguage)
}
