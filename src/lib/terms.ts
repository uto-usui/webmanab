// ターム一覧はコレクションにしない。file() loader だと getCollection の返り順がファイルの順にならず、
// どのみち並べ直すので、JSON を読んで検証し、ここで名前順に並べる
import { termListSchema, type Term } from './schema'
import type { Taxonomy } from './site'

export type { Term }

// エクスポーターの出力を取り込む前でもビルドが通るよう、ファイルがなければ空にする
const files = import.meta.glob<unknown>('/src/content/terms/*.json', {
  eager: true,
  import: 'default',
})

/** 旧 WP API の既定（名前順、大文字小文字を区別しない）と同じ並び */
export const sortTerms = <T extends Pick<Term, 'name'>>(terms: readonly T[]) =>
  terms
    .map((term) => ({ term, key: term.name.toLowerCase() }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map(({ term }) => term)

export const parseTerms = (raw: unknown) => sortTerms(termListSchema.parse(raw))

/** ターム一覧ページのルート用。投稿 0 件のタームも含む（旧 URL を残すため） */
export const getTerms = (tax: Taxonomy): Term[] => {
  const raw = files[`/src/content/terms/${tax}.json`]
  return raw === undefined ? [] : parseTerms(raw)
}

export const getAllTerms = (): Record<Taxonomy, Term[]> => ({
  tips: getTerms('tips'),
  clips: getTerms('clips'),
  labs: getTerms('labs'),
})

/** 投稿 0 件のターム（labs 332 / 333）はメニューに出さない（README 3 章の 6） */
export const forMenu = <T extends Pick<Term, 'count'>>(terms: readonly T[]) =>
  terms.filter((term) => term.count > 0)

/** メニュー用のターム一覧（名前順） */
export const menuTerms = (tax: Taxonomy) => forMenu(getTerms(tax))

export const termPath = (tax: Taxonomy, id: number) => `/${tax}/${id}/`
