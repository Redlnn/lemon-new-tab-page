import { PluginLunar } from 'dayjs-plugin-lunar'
import type { PluginFunc } from 'dayjs/esm'
import dayjs from 'dayjs/esm'
import localizedFormat from 'dayjs/esm/plugin/localizedFormat'
import i18next from 'i18next'

import { getLang } from '@/shared/lang'

// 使用 eager: false 确保完全动态导入,避免与 dayjs 内部的静态导入冲突
const dayjsLocales = import.meta.glob('/node_modules/dayjs/esm/locale/{zh*,en}.js', {
  eager: false
}) as Record<string, () => Promise<{ default: ILocale }>>

dayjs.extend(localizedFormat)
dayjs.extend(PluginLunar as PluginFunc<{ traditional?: boolean }>)

const changeLanguage = async (lng: string) => {
  const language = lng.toLowerCase()
  const loader = dayjsLocales[`/node_modules/dayjs/esm/locale/${language}.js`]
  const fallback = lng?.startsWith('zh')
    ? dayjsLocales['/node_modules/dayjs/esm/locale/zh-cn.js']
    : dayjsLocales['/node_modules/dayjs/esm/locale/en.js']

  const mod = await (loader || fallback)?.()
  const localeData = mod?.default
  if (localeData?.name) {
    dayjs.locale(localeData.name, localeData, true)
    dayjs.locale(localeData.name)
  }
}

export const initDayjs = async () => {
  const lang = getLang()
  await changeLanguage(lang)

  // 当语言切换时，同步 dayjs 语言
  i18next.on('languageChanged', changeLanguage)
}
