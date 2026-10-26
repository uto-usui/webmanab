// 旧サイトにあったものと、公開後に足したものを分ける。件数や指紋は旧記事だけで固定し、
// URL の一覧は「旧 URL がすべてある」と「それ以外は許したページだけ」の 2 つで見る（#45）
import { readFileSync } from 'node:fs'
import { entryPath } from '../../src/lib/posts'
import { TAXONOMIES } from '../../src/lib/site'
import { termPath } from '../../src/lib/terms'

/** 新しい記事の id はここから振る（docs/operations の 1 章）。旧 WordPress の id は 2883 まで */
export const NEW_POST_ID = 3000
/** 旧 WordPress のターム id の最大。新しいタームはこれより大きい id にする */
export const LEGACY_TERM_MAX_ID = 366

/** 公開後に足した、記事でもタームでもないページ。ページを足すときにここへ 1 行書く */
export const ADDED_PAGES: readonly string[] = ['/search/', '/404.html']

export const isLegacy = ({ data }: { data: { id: number } }) =>
  data.id < NEW_POST_ID

/** 旧サイトの URL（デコードしたパス） */
export const legacyPaths = new Set(
  readFileSync(new URL('../fixtures/legacy-urls.txt', import.meta.url), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((url) => decodeURIComponent(url)),
)

type Entry = Parameters<typeof entryPath>[0] & { data: { id: number } }
type Terms = Partial<Record<string, readonly { id: number }[] | undefined>>

/** 旧 URL に加えて、出てよいページ（デコードしたパス） */
export const allowedPaths = (entries: readonly Entry[], terms: Terms) =>
  new Set([
    ...legacyPaths,
    ...ADDED_PAGES,
    ...entries
      .filter((entry) => !isLegacy(entry))
      .map((entry) => decodeURIComponent(entryPath(entry))),
    ...TAXONOMIES.flatMap((tax) =>
      (terms[tax] ?? [])
        .filter(({ id }) => id > LEGACY_TERM_MAX_ID)
        .map(({ id }) => termPath(tax, id)),
    ),
  ])
