// @ts-check

import eslint from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettierConfig from '@vue/eslint-config-prettier'
import vueTsEslintConfig from '@vue/eslint-config-typescript'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue,js,cjs,mjs,jsx}']
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['auto-imports.d.ts', 'components.d.ts', '.output/*', '.wxt/*']
  },
  eslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  {
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
    files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.cjx'],

    rules: {
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  prettierConfig
]
