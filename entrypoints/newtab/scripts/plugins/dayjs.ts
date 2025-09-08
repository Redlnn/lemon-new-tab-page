import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-hk'
import 'dayjs/locale/zh-tw'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { browser } from 'wxt/browser'

dayjs.extend(relativeTime)

// 根据浏览器语言设置 dayjs 语言
const browserLocale = browser.i18n.getMessage('@@ui_locale')

dayjs.locale(browserLocale)

export default dayjs
