// @ts-check

import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import oxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue,js,cjs,mjs,jsx}']
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['auto-imports.d.ts', 'components.d.ts', '.output/*', '.wxt/*']
  },
  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
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
]
