import { createPinia } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { createApp, toRaw } from 'vue'
import { browser } from 'wxt/browser'

import './scripts/plugins/dayjs'
import changeTheme from './scripts/use-element-plus-theme'
import { i18n } from '@/.wxt/i18n'
import {
  initSettings,
  saveSettings,
  useSettingsStore,
  CURRENT_CONFIG_VERSION
} from '@/shared/settings'
import { initSyncSettings, useSyncDataStore, type SyncMessage } from '@/shared/sync'

import './styles/index.scss'

import App from './App.vue'

const lang = browser.i18n.getUILanguage()

document.documentElement.lang = lang
document.title = i18n.t('newtab.title')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

console.log('Initializing settings storage with config version', CURRENT_CONFIG_VERSION)
initSettings().then(() => {
  const settingsStore = useSettingsStore()
  const saveSettingsDebounced = useDebounceFn(saveSettings, 100)

  changeTheme(settingsStore.primaryColor)

  settingsStore.$subscribe(async (mutation, state) => {
    await saveSettingsDebounced(toRaw(state))
  })

  if (settingsStore.sync.enabled) {
    initSyncSettings(settingsStore.$state)
      .then(() => {
        browser.runtime.onMessage.addListener(async (message) => {
          const isSyncMessage = (msg: unknown): msg is SyncMessage =>
            typeof msg === 'object' &&
            msg !== null &&
            'type' in msg &&
            typeof (msg as { type: unknown }).type === 'string' &&
            (msg as { type: string }).type === 'SYNC_UPDATE'

          if (isSyncMessage(message)) {
            const syncDataStore = useSyncDataStore()
            await syncDataStore.checkCloudSync()
          }
        })
      })
      .then(() => app.mount('body'))
  } else {
    app.mount('body')
  }
})
