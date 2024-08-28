import { defineConfig } from 'wxt'

import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import svgLoader from 'vite-svg-loader'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: '柠檬起始页',
    author: 'Red_lnn<lemon@redlnn.top>',
    description:
      '一个开源、简洁、美观且方便使用的浏览器起始页，带有搜索建议、Bing壁纸功能，可添加快速访问网站且展示最常访问网站。',
    icons: {
      512: '/icon.png'
    },
    permissions: ['topSites', 'storage', 'favicon'],
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
        // allow auto load markdown components under `./components/`
        extensions: ['vue'],
        // allow auto import and register components used in markdown
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/ // .md
        ],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ],
        dts: 'components.d.ts'
      })
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/element/index.scss" as *;`
        }
      }
    },
  })
})
