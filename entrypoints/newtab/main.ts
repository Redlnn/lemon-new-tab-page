import { createPinia } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { createApp, toRaw } from 'vue'
import { browser } from 'wxt/browser'

import './scripts/plugins/dayjs'
import changeTheme from './scripts/use-element-plus-theme'
import { i18n } from '@/.wxt/i18n'
import { initSettings, saveSettings, useSettingsStore } from '@/shared/settings'
import { initSyncSettings } from '@/shared/sync'

import 'element-plus/theme-chalk/el-message-box.css'
import './styles/index.scss'

import App from './App.vue'

let color = ''
const lang = browser.i18n.getUILanguage()

document.documentElement.lang = lang
document.title = i18n.t('newtab.title')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 先初始化设置，再挂载vue，再初始化云同步
initSettings()
  .then(() => {
    const settingsStore = useSettingsStore()
    const saveSettingsDebounced = useDebounceFn(saveSettings, 100)

    changeTheme(settingsStore.primaryColor)
    color = settingsStore.primaryColor

    settingsStore.$subscribe(async (_mutation, state) => {
      await saveSettingsDebounced(toRaw(state))
      if (state.primaryColor !== color) {
        if (state.primaryColor === null) {
          state.primaryColor = '#1677ff'
        }
        color = state.primaryColor
        changeTheme(state.primaryColor)
      }
    })

    app.mount('body')
  })
  .then(() => {
    const settingsStore = useSettingsStore()
    if (settingsStore.sync.enabled) {
      initSyncSettings(settingsStore)
    }
  })
