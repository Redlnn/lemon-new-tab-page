import { defineConfig } from 'wxt'

import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import svgLoader from 'vite-svg-loader'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue', '@wxt-dev/i18n/module'],
  manifest: {
    name: '__MSG_extension_name__',
    author: 'Red_lnn<lemon@redlnn.top>',
    description: '__MSG_extension_description__',
    default_locale: 'zh',
    icons: {
      512: '/icon.png'
    },
    permissions: import.meta.env.CHROME || import.meta.env.EDGE ? ['topSites', 'storage', 'favicon'] : ['topSites', 'storage'],
    host_permissions: [
      'https://cn.bing.com/',
      'https://api.bing.com/',
      'https://suggestion.baidu.com/',
      'https://suggestqueries.google.com/',
      'https://v2.jinrishici.com/'
    ]
  },
  vite: () => ({
    plugins: [
      svgLoader(),
      Components({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/ // .vue
        ],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ],
        dts: 'types/components.d.ts'
      })
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/element/index.scss" as *;`
        }
      }
    }
  })
})
