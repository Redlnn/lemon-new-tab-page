import './styles/index.scss'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { usePreferredDark } from '@vueuse/core'

import { i18n, i18nInitPromise } from '@/shared/i18n'

import App from './App.vue'

const preferredDark = usePreferredDark()
watch(
  preferredDark,
  () => {
    if (preferredDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  },
  { immediate: true }
)

i18nInitPromise.then(async () => {
  const app = i18n(createApp(App))
  const pinia = createPinia()

  app.use(pinia)

  // 初始化设置
  await initSettings()
  const settings = useSettingsStore()

  // 应用主题色
  changeTheme(settings.theme.primaryColor)

  // 应用 colorful 模式
  toggleDocumentClass('colorful', settings.theme.colorfulMode)

  // 应用莫奈模式
  if (settings.theme.monetColor) {
    const monetColors = await getMonetColors()
    if (monetColors) {
      applyStoredMonetColors(monetColors)
      toggleDocumentClass('monet', true)
    }
  }

  app.mount('body')
})
