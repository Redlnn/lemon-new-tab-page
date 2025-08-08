import { createPinia } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { createApp, toRaw } from 'vue'
import { browser } from 'wxt/browser'

import { version } from '@/package.json'
import './scripts/plugins/dayjs'
import changeTheme from './scripts/use-element-plus-theme'
import { i18n } from '@/.wxt/i18n'
import { initSettings, saveSettings, useSettingsStore } from '@/shared/settings'
import { initSyncSettings } from '@/shared/sync'

import 'element-plus/theme-chalk/el-message-box.css'
import './styles/index.scss'

import App from './App.vue'

const banner = `

%c Lemon New Tab %c ${version} %c

                    ~~<~<~~<~<~~<~<~~<~~
              <~~<~~<~{{{rhhhahhhhx}{{~<~~<~~<
           <~<~<~|Uhhhahhhhao&W*ahhhhahhhU|~<~<~<
        -~~<~?Chhhh     khkhh  hkhkk     hhhhC?~~<~-
      +<~<~Jhhak   *hhhahhhhh  hhhahhhah*   kahhJ~~<~+
     <~~<uhah   khhhahhhhahah  ahhhhahhhhhhk   hahu~<~<
   <~<~thaa     hahhhahahhhha  hahahhhahahaa     ahht~<~<
   <~~khh8 Bahhh  dahhhhhahha  hhhhhahhhad  hhhaB 8hhh~~~
 ~~~_hah  hhhhahhhk  ahahhahh  ahahhhaa  khhhhhhhh  hhh_<~~
~<~<Uhh  hhhahhhhhhh   ahhhha  hhhaha   hhhhahahahh  ahU<~<~
~<~(ha  hhhahhahahahhhh  Maha  ahaM  hhhahhhhhhhhhhh  hh|~<~
~~<hho  hhhhhhhhhhhahahhh          hhahhhhahahahahah  oak~~<
<~~hh                                                  hh~<~
~<~kao  hhhhhhhhhhhhhhhah          hhhhhhhhhhhhhhhhh  oah<~~
~~<|hh  hhahahahahahahh  Mahh  hhaM  hahahahahahahah  hh|<~~
<~~<Uhh  hhhhhhhhhhh   ahhhha  ahhhha   hhhhhhhhhhh  haU<~<~
 ~<~_hah  hhahahahk  ahhhahha  hhahahha  khhahahah  hhh_~<~
   ~<+khh8 Bahhh  dahhhahhahh  ahhhhhahhad  hhhaB 8hhh~~<
   <~<~thha     ahhahhahhhhha  hhahahhhhahhh     ahht~<~<
     <~~~uhah   khhhahhhahahh  ahhhhhahhhhak   hahv~~<~
      +<~~~Jhhah   *hhahhhhha  hhahahhaa*   kahaJ<~<~+
        -~<~~?Chhhh     hhhhh  hhhkk     hhhaJ?~~<~-
           <~<~~~|Uhhhaakhkao&W*hhhhahhhhU|~<~~<<
              <<~<~~~~{}{nhhhhhhahn}{{~~~~~<~<
                    ~<~<~<~~~~~~<~<~<~<~
`

console.log(
  banner,
  'padding: 2px 6px; border-radius: 4px 0 0 4px; color: #fff; background: #ff9d00; font-weight: bold;',
  'padding: 2px 6px; border-radius: 0 4px 4px 0; color: #fff; background: #ffbf00; font-weight: bold;',
  'color: orange;line-height:0.8rem;'
)

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
