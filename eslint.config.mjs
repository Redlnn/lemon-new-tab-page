// @ts-check

import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import oxlint from 'eslint-plugin-oxlint'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue,js,cjs,mjs,jsx}']
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['auto-imports.d.ts', 'components.d.ts', '.output/*', '.wxt/*']
  },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    name: 'app/overrides',
    rules: {
      'no-var': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    name: 'app/overrides-js',
    files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.cjx'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  oxlint.configs['flat/recommended'],
  skipFormatting
)
