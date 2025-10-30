import './styles/index.scss'

import { createPinia } from 'pinia'
import { useDebounceFn } from '@vueuse/core'

import { version } from '@/package.json'

import { initBookmark } from '@/shared/bookmark'
import { initCustomSearchEngine } from '@/shared/customSearchEngine'
import { i18n } from '@/shared/i18n'
import { defaultSettings, initSettings, saveSettings, useSettingsStore } from '@/shared/settings'
import { initSyncSettings } from '@/shared/sync'

import App from './App.vue'
import changeTheme from './scripts/use-element-plus-theme'

export const main = async () => {
  const banner = `
%c Lemon New Tab %c ${version}%c

`

  console.log(
    banner,
    'padding: 2px 6px; border-radius: 4px 0 0 4px; color: #fff; background: #ff9d00; font-weight: bold;',
    'padding: 2px 6px; border-radius: 0 4px 4px 0; color: #fff; background: #ffbf00; font-weight: bold;',
    ''
  )

  if (import.meta.env.DEV) {
    const devBanner = `%c
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
    console.log(devBanner, 'color: orange;line-height:0.8rem;')
  }

  let color = ''
  const app = i18n(createApp(App))
  const pinia = createPinia()

  app.use(pinia)

  // 先初始化设置，再挂载vue，再初始化云同步
  await initSettings()
  await initCustomSearchEngine()
  await initBookmark()
  const settings = useSettingsStore()

  // 判断设置变更时再保存，避免无意义的写入
  let lastSavedState: string | null = null
  const saveSettingsDebounced = useDebounceFn(async (state: typeof settings.$state) => {
    // 序列化当前状态用于比较
    const currentState = JSON.stringify(state)

    // 如果状态没有变化，跳过保存
    if (lastSavedState === currentState) {
      return
    }

    lastSavedState = currentState
    await saveSettings(state)
  }, 500)

  if (settings.primaryColor.toLowerCase() === '#ffbb00') {
    // 强制替换旧版本对比度过低的主题色
    settings.primaryColor = defaultSettings.primaryColor
    await saveSettings(settings)
    lastSavedState = JSON.stringify(toRaw(settings.$state))
  }

  changeTheme(settings.primaryColor)
  color = settings.primaryColor

  settings.$subscribe(async (_mutation, state) => {
    // 主题色变化时立即保存，不使用防抖
    if (state.primaryColor !== color) {
      if (state.primaryColor === null) {
        state.primaryColor = defaultSettings.primaryColor
      }
      color = state.primaryColor
      changeTheme(state.primaryColor)

      const currentState = JSON.stringify(state)
      if (lastSavedState !== currentState) {
        lastSavedState = currentState
        await saveSettings(state)
      }
    } else {
      // 其他设置使用防抖保存
      await saveSettingsDebounced(state)
    }
  })

  app.mount('body')

  if (settings.sync.enabled) {
    initSyncSettings(settings)
  }
}
