import { PluginLunar } from 'dayjs-plugin-lunar'
import type { PluginFunc } from 'dayjs/esm'
import dayjs from 'dayjs/esm'
import localizedFormat from 'dayjs/esm/plugin/localizedFormat'

import { lang } from '@/shared/lang'

const dayjsZhLocales = import.meta.glob('/node_modules/dayjs/esm/locale/zh*.js') as Record<
  string,
  () => Promise<{ default: ILocale }>
>
console.log(dayjsZhLocales)
dayjs.extend(localizedFormat)
dayjs.extend(PluginLunar as PluginFunc<{ traditional?: boolean }>)

export const initDayjs = async () => {
  if (lang.startsWith('zh')) {
    const language = lang.toLowerCase()
    const loader = dayjsZhLocales[`/node_modules/dayjs/esm/locale/${language}.js`]
    const fallback = dayjsZhLocales['/node_modules/dayjs/esm/locale/zh-cn.js']!

    const mod = loader ? await loader() : await fallback()
    const localeData = mod.default

    if (localeData?.name) {
      dayjs.locale(localeData)
      console.log('✅ dayjs locale applied:', localeData.name)
    }
  }
}
