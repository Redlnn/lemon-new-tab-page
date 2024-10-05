import { createPinia } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { createApp, toRaw } from 'vue'

import './js/plugins/dayjs'
import changeTheme from './js/use-element-plus-theme'
import { i18n } from '@/.wxt/i18n'
import { initSettings, saveSettings, useSettingsStore } from './js/store/settingsStore'

import './css/index.scss'

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

document.title = i18n.t('newtab.title')

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
