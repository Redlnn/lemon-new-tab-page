import { fileURLToPath, URL } from 'node:url'

import { defineConfig, splitVendorChunk } from 'vite'
import vue from '@vitejs/plugin-vue'

import webExtension, { readJsonFile } from 'vite-plugin-web-extension'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import svgLoader from 'vite-svg-loader'

function generateManifest() {
  const manifest = readJsonFile('src/manifest.json')
  const pkg = readJsonFile('package.json')
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ['package.json', 'manifest.json']
    }),
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
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
      dts: 'src/components.d.ts'
    }),
    svgLoader()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id, { getModuleIds, getModuleInfo }) {
          const i = splitVendorChunk()(id, { getModuleIds, getModuleInfo })
          if (i === 'vendor') {
            let depName = id.toString().split('node_modules/.pnpm/')[1].split('/')[0].toString()
            if (depName[0] === '@') {
              depName = `@${depName.slice(1).split('@')[0].toString()}`
            }
            return `js/${depName}`
          } else {
            return i
          }
        }
      }
    }
  }
})
