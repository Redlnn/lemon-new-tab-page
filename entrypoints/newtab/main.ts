import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from '@/.wxt/i18n'

import './js/plugins/dayjs'

import './css/index.scss'

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

document.title = i18n.t('newtab.title')

app.use(pinia)

app.mount('body')
