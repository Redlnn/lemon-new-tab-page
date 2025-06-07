import 'dayjs/locale/zh-cn'
import { browser } from 'wxt/browser'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

// 根据浏览器语言设置 dayjs 语言
const browserLocale = browser.i18n.getMessage('@@ui_locale')

dayjs.locale(browserLocale)

export default dayjs
