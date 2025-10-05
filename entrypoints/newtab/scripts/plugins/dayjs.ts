import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-hk'
import 'dayjs/locale/zh-tw'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { lang } from '@/shared/lang'

dayjs.extend(relativeTime)
dayjs.locale(lang)

export default dayjs
