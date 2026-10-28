// pnpm new が作る記事の中身を決める。ファイルは読み書きせず、new.ts が渡したものだけを見る
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter'
import {
  postFile,
  type Frontmatter,
  type Term as TermRef,
} from '../export-markdown/frontmatter.ts'
import type { ImageRef } from '../export-markdown/image-manifest.ts'
import type { Term } from '../../src/lib/schema.ts'
import {
  LEGACY_TERM_MAX_ID,
  NEW_POST_ID,
  TAXONOMIES,
  TAXONOMY_OF,
  type PostType,
  type Taxonomy,
} from '../../src/lib/site.ts'
import type { VaultFile } from '../sync-vault/plan.ts'

interface VaultPost {
  type?: unknown
  id?: unknown
  slug?: unknown
  terms?: unknown
}

const frontmatterOf = (raw: string): VaultPost => {
  try {
    return parseFrontmatter(raw).frontmatter
  } catch {
    // 読めない記事は sync が止めるので、ここでは飛ばす
    return {}
  }
}

const termRefs = (post: VaultPost): TermRef[] =>
  Array.isArray(post.terms)
    ? post.terms.filter(
        (t): t is TermRef =>
          typeof t?.id === 'number' &&
          typeof t?.name === 'string' &&
          typeof t?.slug === 'string',
      )
    : []

/** vault の記事を、新しい記事の id・slug・タームを決めるのに要る形にまとめる */
export function readVault(posts: VaultFile[]) {
  return posts.map(({ path, raw }) => ({ path, ...frontmatterOf(raw) }))
}
export type Vault = ReturnType<typeof readVault>

/** 下書きを含む vault の最大の id と 2999 の大きいほうに 1 を足す */
export const nextPostId = (vault: Vault) =>
  Math.max(
    NEW_POST_ID - 1,
    ...vault.map(({ id }) => (typeof id === 'number' ? id : 0)),
  ) + 1

/** 英数字とハイフンだけにする。空になることがある */
export const slugify = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * clip の slug。「Name | 説明」のようなタイトルは区切りの前だけを使う。
 * 英数字が残らなければホスト名から作り、vault の clip と重なれば -2 から番号を付ける
 */
export function clipSlug(title: string, url: string, vault: Vault) {
  const head = title.split(/\s[|｜\-–—:]\s|[|｜]/)[0]
  const base =
    slugify(head) ||
    slugify(title) ||
    slugify(new URL(url).hostname.replace(/^www\./, ''))
  const taken = new Set(
    vault.filter((p) => p.type === 'clip').map((p) => p.slug),
  )
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
  return slug
}

/**
 * --tags の名前を、ターム JSON と vault の記事にあるタームから探す（name か slug、大文字・小文字を区別しない）。
 * ないものは、どのタクソノミーとも重ならない新しい id にし、created にも入れる
 */
export function resolveTerms(
  tags: string[],
  type: PostType,
  terms: Record<Taxonomy, Term[]>,
  vault: Vault,
): { terms: TermRef[]; created: TermRef[] } {
  const tax = TAXONOMY_OF[type]
  // sync に写す前の新しいタームは、vault の記事にしかない
  const known: TermRef[] = [
    ...terms[tax],
    ...vault.filter((p) => p.type === type).flatMap(termRefs),
  ]
  let nextId =
    Math.max(
      LEGACY_TERM_MAX_ID,
      ...TAXONOMIES.flatMap((t) => terms[t].map(({ id }) => id)),
      ...vault.flatMap(termRefs).map(({ id }) => id),
    ) + 1

  const result: TermRef[] = []
  const created: TermRef[] = []
  for (const tag of tags) {
    const key = tag.toLowerCase()
    const found = known.find(
      (t) => t.name.toLowerCase() === key || t.slug.toLowerCase() === key,
    )
    let term: TermRef
    if (found) term = { id: found.id, name: found.name, slug: found.slug }
    else {
      const slug = slugify(tag)
      if (!slug)
        throw new Error(
          `タグ「${tag}」から slug を作れません。英数字を含めてください`,
        )
      term = { id: nextId++, name: tag, slug }
      known.push(term)
      created.push(term)
    }
    if (!result.some(({ id }) => id === term.id)) result.push(term)
  }
  return { terms: result, created }
}

/** `2026-10-27T10:00:00+09:00` の形。動かす場所のタイムゾーンによらず日本時間で書く */
export const jstTimestamp = (date: Date) =>
  `${new Date(date.getTime() + 9 * 3600_000).toISOString().slice(0, 19)}+09:00`

export interface NewPost {
  id: number
  type: PostType
  slug: string
  title: string
  date: Date
  terms: TermRef[]
  body: string
  clipUrl?: string
  image?: ImageRef & { thumb: string }
  fullImage?: ImageRef
}

export function postContent(post: NewPost) {
  const fm: Frontmatter = {
    id: post.id,
    type: post.type,
    slug: post.slug,
    title: post.title,
    date: jstTimestamp(post.date),
    // 空のままだと type ごとの汎用のアイキャッチになる
    primaryTag: post.terms[0]?.name ?? '',
    terms: post.terms,
    ...(post.clipUrl ? { clipUrl: post.clipUrl } : {}),
    ...(post.image ? { image: post.image } : {}),
    ...(post.fullImage ? { fullImage: post.fullImage } : {}),
    draft: true,
  }
  return postFile(fm, post.body)
}
