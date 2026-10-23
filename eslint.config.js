import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  // 旧 SCSS は手順 2 で src/styles に移すまで残している
  globalIgnores([
    'dist/',
    'dist-catalog/',
    '.astro/',
    '.snapshot/',
    'docs/',
    'test-results/',
    'playwright-report/',
    'assets/',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    files: ['public/sw.js', 'test/fixtures/legacy-sw.js'],
    languageOptions: { globals: globals.serviceworker },
  },
  {
    files: ['scripts/**', 'e2e/**', 'test/**', '*.config.*'],
    languageOptions: { globals: globals.node },
  },
  prettier,
])
