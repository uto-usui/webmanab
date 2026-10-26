// ビルドの最後に、記事ページの本文から検索の索引（dist/pagefind/）を作る（#46）。
// 索引に入れる範囲は data-pagefind-body、検索結果のカードに要る値は SearchMeta.astro が持つ
import { fileURLToPath } from 'node:url'
import * as pagefind from 'pagefind'

export default function search() {
  return {
    name: 'webmanab-pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir)
        try {
          const { index, errors } = await pagefind.createIndex({})
          if (!index) throw new Error(errors.join('\n'))
          const added = await index.addDirectory({ path: root })
          if (added.errors.length) throw new Error(added.errors.join('\n'))
          const written = await index.writeFiles({
            outputPath: `${root}pagefind`,
          })
          if (written.errors.length) throw new Error(written.errors.join('\n'))
          logger.info(`${added.page_count} ページを索引にした`)
        } finally {
          await pagefind.close()
        }
      },
    },
  }
}
