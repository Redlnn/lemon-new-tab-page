import './styles/index.scss'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { usePreferredDark } from '@vueuse/core'

import { i18n } from '@/shared/i18n'
import { initSettings, useSettingsStore } from '@/shared/settings'
import { applyStoredMonetColors, changeTheme, getMonetColors } from '@/shared/theme'

import App from './App.vue'

export const main = async () => {
  const app = i18n(createApp(App))
  const pinia = createPinia()

  app.use(pinia)

  // 初始化设置
  await initSettings()
  const settings = useSettingsStore()

  // 应用主题色
  changeTheme(settings.theme.primaryColor)

  // 工具函数：切换 DOM 类名
  const toggleDocumentClass = (className: string, shouldAdd: boolean) => {
    document.documentElement.classList.toggle(className, shouldAdd)
  }

  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }

  // 跟随系统
  // Popup 更适合跟随系统深色模式
  const preferredDark = usePreferredDark()
  applyDarkMode(preferredDark.value)

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
}
