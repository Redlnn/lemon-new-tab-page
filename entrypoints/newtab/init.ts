import { i18nInitPromise } from '@/shared/i18n'

import { initDayjs } from './shared/dayjs'

i18nInitPromise.then(async () => {
  await initDayjs()
  const { main } = await import('./main')
  await main()
})
