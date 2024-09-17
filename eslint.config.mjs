// @ts-check

import globals from 'globals'

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  {
    ignores: [
      'eslint.config.mjs',
      'auto-imports.d.ts',
      'components.d.ts',
      'web-ext.config.ts',
      'node_modules/*',
      '.output/*',
      '.wxt/*'
    ]
  },
  eslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  // stylistic 需配合 parserOptions.project，但是指定了 project 后会很慢
  // ...tseslint.configs.stylisticTypeChecked,
  {
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': tseslint.plugin
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
        ...globals.browser
      },

      parser: vueParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        // project: ['tsconfig.app.json'],  // 配合 stylisticTypeChecked 用，但是太慢了
        extraFileExtensions: ['.vue'],
        ecmaFeatures: {
          jsx: true
        },
        parser: {
          js: 'espree',
          jsx: 'espree',
          cjs: 'espree',
          mjs: 'espree',
          ts: tseslint.parser,
          tsx: tseslint.parser,
          cts: tseslint.parser,
          mts: tseslint.parser
        }
      }
    },
    rules: {
      'no-var': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'vue/multi-word-component-names': 'off',

      'sort-imports': [
        'error',
        {
          memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
          allowSeparatedGroups: true
        }
      ]
    }
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],

    rules: {
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  eslintConfigPrettier
]
