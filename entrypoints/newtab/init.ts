import { i18nInitPromise } from '@/shared/i18n'

i18nInitPromise.then(async () => {
  const { main } = await import('./main')
  await main()
})
