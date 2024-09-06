import { browser } from 'wxt/browser'
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

if (browser.i18n.getMessage('@@ui_locale').startsWith('zh')) {
  dayjs.locale('zh-cn')
}

export default dayjs
