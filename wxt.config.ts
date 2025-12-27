import { fileURLToPath, URL } from 'node:url'

import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import i18nextLoader from 'vite-plugin-i18next-loader'
import svgLoader from 'vite-svg-loader'
import { defineConfig } from 'wxt'

import { keepFirst5H2Plugin } from './scripts/mdit-keep-first-5-h2'
import { removeH1Plugin } from './scripts/mdit-remove-h1'

const baseManifest = {
  name: '__MSG_extension_name__',
  author: 'Red_lnn<lemon@redlnn.top>',
  description: '__MSG_extension_description__',
  default_locale: 'en',
  icons: {
    16: '/icon-16.png',
    24: '/icon-24.png',
    32: '/icon-32.png',
    48: '/icon-48.png',
    64: '/icon-64.png',
    96: '/icon-96.png',
    128: '/icon-128.png',
    256: '/icon-256.png',
    512: '/icon-512.png'
  },
  host_permissions: [
    'https://www.bing.com/',
    'https://api.bing.com/',
    'https://suggestion.baidu.com/',
    'https://suggestqueries.google.com/',
    'https://v2.jinrishici.com/'
  ],
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'none'; img-src 'self' https: http: data: blob:"
  }
}

if (import.meta.env.DEV) {
  baseManifest.host_permissions.push('http://localhost/')
}

const firefoxManifest = {
  ...baseManifest,
  permissions: ['topSites', 'storage', 'alarms', 'bookmarks', 'activeTab', 'tabs'],
  optional_permissions: ['*://*/*'],
  chrome_settings_overrides: {
    homepage: 'newtab.html'
  }
}

const chromeManifest = {
  ...baseManifest,
  permissions: ['topSites', 'storage', 'favicon', 'alarms', 'bookmarks', 'activeTab', 'tabs'],
  optional_host_permissions: ['*://*/*']
}

const elementPlusResolver = ElementPlusResolver({
  importStyle: 'sass'
})

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/webextension-polyfill'],
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
      Vue({
        include: [/\.vue$/, /\.md$/]
      }), // 自己添加 @vitejs/plugin-vue 不使用 @wxt-dev/module-vue
      i18nextLoader({
        paths: ['./locales']
      }),
      svgLoader(),
      Markdown({
        include: [/CHANGELOG.*\.md$/],
        markdownItSetup(md) {
          md.use(removeH1Plugin)
          md.use(keepFirst5H2Plugin)
        }
      }),
      Markdown({
        include: [/\.md$/],
        exclude: [/CHANGELOG.*\.md$/]
      }),
      AutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.vue\.[tj]sx?\?vue/ // .vue (vue-loader with experimentalInlineMatchResource enabled)
        ],
        imports: ['vue'],
        resolvers: [elementPlusResolver],
        viteOptimizeDeps: true,
        dts: 'types/auto-imports.d.ts'
      }),
      Components({
        resolvers: [elementPlusResolver],
        dts: 'types/components.d.ts'
      })
    ],
    build: {
      sourcemap: false // for HMP (@wxt-dev/module-vue 会自动添加)
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./', import.meta.url)),
        '@newtab': fileURLToPath(new URL('./entrypoints/newtab', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/element/index.scss" as *;`
        }
      }
    }
  })
})
