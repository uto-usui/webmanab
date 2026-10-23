import { satteri } from '@astrojs/markdown-satteri'
import { defineConfig, envField } from 'astro/config'
import { hastPlugins, markdownFeatures } from './src/lib/markdown/index.mjs'

// astro.config は .env を自動では読まない。process.env にすでにある値は上書きされない
try {
  process.loadEnvFile()
} catch {
  // .env がなければ環境変数だけを使う
}
const { SITE_URL } = process.env
// canonical / OGP / sitemap / RSS の絶対 URL のもとになるので、ビルドでは必須にする
if (process.argv.includes('build') && !SITE_URL) {
  throw new Error('SITE_URL が未設定です（.env.example を参照）')
}

export default defineConfig({
  site: SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
  scopedStyleStrategy: 'attribute',
  prerenderConflictBehavior: 'error',
  markdown: {
    // コードの色は hljs プラグインで旧サイトと同じ highlight.js 10.1.1 を当てる。Shiki / Prism は使わない
    syntaxHighlight: false,
    processor: satteri({ features: markdownFeatures, hastPlugins }),
  },
  env: {
    schema: {
      PUBLIC_GA4_ID: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_ADSENSE_CLIENT: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },
})
