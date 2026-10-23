// CATALOG=1 のときだけ astro.config.mjs から足す。本番のビルドには入らない（07 の 4.1）
import { URL } from 'node:url'

export default function catalog() {
  return {
    name: 'webmanab-catalog',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        const route = (pattern, file) =>
          injectRoute({ pattern, entrypoint: new URL(file, import.meta.url) })
        route('/catalog', './Index.astro')
        route('/catalog/index.json', './index.json.ts')
        route('/catalog/[component]/[story]', './Story.astro')
      },
    },
  }
}
