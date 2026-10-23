import { defineConfig, envField } from 'astro/config'

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
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // 旧 Nuxt の style-resources と同じく、全部の SCSS の先頭に変数と mixin を足す
          additionalData: `@import "/src/styles/foundation/variable/_variable.scss", "/src/styles/foundation/mixin/_mixin.scss";\n`,
          // @use への書き換えは見た目の確認が済んでから別の作業で行う
          silenceDeprecations: ['import'],
        },
      },
    },
  },
})
