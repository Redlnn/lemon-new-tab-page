import './styles/index.scss'

import { createPinia } from 'pinia'
import { useColorMode, useDebounceFn, usePreferredDark } from '@vueuse/core'

import { version } from '@/package.json'

import { i18n } from '@/shared/i18n'
import { defaultSettings, initSettings, saveSettings, useSettingsStore } from '@/shared/settings'
import { initShortcut } from '@/shared/shortcut'
import { initSyncSettings } from '@/shared/sync'
import { applyStoredMonetColors, getMonetColors } from '@/shared/theme'

import { initCustomSearchEngine } from '@newtab/shared/customSearchEngine'

import App from './App.vue'
import { setupAutoSaveSettings } from './shared/autoSaveSettings'
import { changeTheme } from './shared/theme'

const preferredDark = usePreferredDark()
const { store } = useColorMode()
watch(
  preferredDark,
  () => {
    if (store.value === 'auto') {
      if (preferredDark.value) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
    }
  },
  { immediate: true }
)

export const main = async () => {
  const banner = `\n%c Lemon New Tab %c ${version}%c\n\n`

  console.log(
    banner,
    'padding: 2px 6px; border-radius: 4px 0 0 4px; color: #fff; background: #ff9d00; font-weight: bold;',
    'padding: 2px 6px; border-radius: 0 4px 4px 0; color: #fff; background: #ffbf00; font-weight: bold;',
    ''
  )

  const app = i18n(createApp(App))
  const pinia = createPinia()

  app.use(pinia)

  await initSettings()
  await initCustomSearchEngine()
  await initShortcut()
  const settings = useSettingsStore()

  changeTheme(settings.theme.primaryColor)

  // 如果开启了莫奈模式，先应用之前存储的莫奈配色，避免加载壁纸期间的视觉跳变
  if (settings.theme.monetColor) {
    const storedColors = await getMonetColors()
    if (storedColors) {
      applyStoredMonetColors(storedColors)
    }
  }

  setupAutoSaveSettings(settings)

  app.mount('body')

  if (settings.sync.enabled) {
    initSyncSettings(settings)
  }
}
