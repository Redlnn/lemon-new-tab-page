import { createPinia } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { createApp, toRaw } from 'vue'
import { browser } from 'wxt/browser'

import './scripts/plugins/dayjs'
import changeTheme from './scripts/use-element-plus-theme'
import { i18n } from '@/.wxt/i18n'
import { initSettings, saveSettings, useSettingsStore } from './scripts/store/settingsStore'

import './styles/index.scss'

import App from './App.vue'

const lang = browser.i18n.getUILanguage()

document.documentElement.lang = lang
document.title = i18n.t('newtab.title')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const settingsStore = useSettingsStore()
const saveSettingsDebounced = useDebounceFn(saveSettings, 100)

initSettings().then(() => {
  changeTheme(settingsStore.primaryColor)

  settingsStore.$subscribe(async (mutation, state) => {
    await saveSettingsDebounced(toRaw(state))
  })

  app.mount('body')
})
