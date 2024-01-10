import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './js/plugins/dayjs'

import './css/index.scss'

import Index from './index.vue'

const app = createApp(Index)
const pinia = createPinia()

app.use(pinia)

app.mount('body')
