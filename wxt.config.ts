import { defineConfig } from 'wxt'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import svgLoader from 'vite-svg-loader'
import vueJsx from '@vitejs/plugin-vue-jsx'

import optimizeDeps from './utils/optimizeDeps'

const baseManifest = {
  name: '__MSG_extension_name__',
  author: 'Red_lnn<lemon@redlnn.top>',
  description: '__MSG_extension_description__',
  default_locale: 'zh_CN',
  icons: {
    512: '/icon.png'
  },
  host_permissions: [
    'https://www.bing.com/',
    'https://api.bing.com/',
    'https://suggestion.baidu.com/',
    'https://suggestqueries.google.com/',
    'https://v2.jinrishici.com/'
  ]
}

if (import.meta.env.DEV) {
  baseManifest.host_permissions.push('http://localhost:3000/')
}

const firefoxManifest = {
  ...baseManifest,
  permissions: ['topSites', 'storage'],
  chrome_settings_overrides: {
    homepage: 'newtab.html'
  }
}

const chromeManifest = {
  ...baseManifest,
  permissions: ['topSites', 'storage', 'favicon'],
  optional_host_permissions: ['*://*/*']
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue', '@wxt-dev/i18n/module', '@wxt-dev/webextension-polyfill'],
  imports: false,
  manifest: ({ browser }) => {
    if (browser === 'firefox') {
      return firefoxManifest
    } else {
      return chromeManifest
    }
  },
  vite: () => ({
    plugins: [
      svgLoader(),
      vueJsx(),
      AutoImport({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ],
        dts: 'types/auto-imports.d.ts'
      }),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ],
        dts: 'types/components.d.ts'
      })
    ],
    resolve: {
      alias: {
        '@/newtab': '/entrypoints/newtab'
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/element/index.scss" as *;`,
          api: 'modern-compiler'
        }
      }
    },
    optimizeDeps: {
      include: optimizeDeps
    }
  })
})
