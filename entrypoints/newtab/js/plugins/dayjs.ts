import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

if (navigator.language.startsWith('zh')) {
  dayjs.locale('zh-cn')
}

export default dayjs
