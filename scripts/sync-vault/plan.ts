// vault の記事から、webmanab に書くものを決める。ファイルは読み書きせず、sync.ts が渡したものだけを見る
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter'
import { postSchema, type PostData, type Term } from '../../src/lib/schema.ts'
import {
  LEGACY_TERM_MAX_ID,
  NEW_POST_ID,
  TAXONOMIES,
  TAXONOMY_OF,
  type Taxonomy,
} from '../../src/lib/site.ts'

export interface VaultFile {
  /** `tip/<file>.md` の形 */
  path: string
  raw: string
}

export interface SyncInput {
  vaultPosts: VaultFile[]
  /** `images/` からの相対パス → 中身 */
  vaultImages: Map<string, Buffer>
  /** `src/content/posts/` からの相対パス → 中身 */
  sitePosts: Map<string, string>
  /** `public/images/` からの相対パスの中身。なければ undefined */
  siteImage: (path: string) => Buffer | undefined
  terms: Record<Taxonomy, Term[]>
  allowDelete?: boolean
}

export interface SyncPlan {
  problems: string[]
  added: string[]
  updated: string[]
  removed: string[]
  /** 書く記事（追加と更新）。`src/content/posts/` からの相対パス → 中身 */
  write: Map<string, string>
  /** public/images/ に写す画像（`images/` からの相対パス） */
  images: string[]
  terms: Record<Taxonomy, Term[]>
  termsChanged: Taxonomy[]
}

/** 誤操作で一度に大量に消さないための上限。超えるときは --allow-delete */
export const MAX_REMOVE = 5

export const expectedFileName = ({ slug, id }: { slug: string; id: number }) =>
  /^[a-z0-9_-]+$/.test(slug) && !slug.startsWith('_')
    ? `${slug}.md`
    : `post-${id}.md`

/** コードの中の `[[` は wikilink ではないので、フェンスとインラインのコードを除いて探す */
export const hasWikilink = (body: string) =>
  /\[\[/.test(
    body
      .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '')
      .replace(/`[^`\n]*`/g, ''),
  )

const RELATIVE_IMAGE = /\]\(\.\.\/images\/([^)\s]+)/g

/** frontmatter はそのまま残し、本文の `](../images/` だけを `](/images/` にする */
export const toSiteRaw = (raw: string) => {
  const end = raw.indexOf('\n---', 3)
  return end < 0
    ? raw
    : raw.slice(0, end) +
        raw.slice(end).replace(/\]\(\.\.\/images\//g, '](/images/')
}

const frontmatterImages = (data: PostData) =>
  [data.image?.src, data.image?.thumb, data.fullImage?.src].filter(
    (src): src is string => src !== undefined,
  )

// scripts/export-markdown/terms.ts の buildTerms と同じ並び（name の昇順、大文字・小文字を区別しない）
const sortTerms = (list: Term[]) =>
  [...list].sort(
    (a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en') ||
      a.id - b.id,
  )

export function planSync(input: SyncInput): SyncPlan {
  const problems: string[] = []
  const published: { path: string; raw: string; data: PostData }[] = []
  const ids = new Map<number, string>()
  const keys = new Map<string, string>()

  for (const { path, raw } of input.vaultPosts) {
    const [dir, file] = path.split('/')
    let frontmatter: Record<string, unknown>
    let body: string
    try {
      ;({ frontmatter, content: body } = parseFrontmatter(raw))
    } catch (error) {
      problems.push(`${path}: frontmatter を読めない（${String(error)}）`)
      continue
    }
    // 下書きは id の重なりだけを見る。F1 は下書きを含めて次の id を振るため
    if (typeof frontmatter.id === 'number') {
      const other = ids.get(frontmatter.id)
      if (other)
        problems.push(`${path}: id ${frontmatter.id} が ${other} と重なる`)
      else ids.set(frontmatter.id, path)
    }
    if (frontmatter.draft === true) continue

    const result = postSchema.safeParse(frontmatter)
    if (!result.success) {
      const issues = result.error.issues.map(
        (issue) => `${issue.path.join('.') || '(root)'} ${issue.message}`,
      )
      problems.push(`${path}: スキーマに合わない（${issues.join('、')}）`)
      continue
    }
    const data = result.data
    if (dir !== data.type)
      problems.push(`${path}: type が ${data.type} なのに ${dir}/ にある`)
    if (file !== expectedFileName(data))
      problems.push(`${path}: ファイル名は ${expectedFileName(data)} にする`)
    const key = `${data.type}/${data.slug}`
    const other = keys.get(key)
    if (other) problems.push(`${path}: ${key} が ${other} と重なる`)
    else keys.set(key, path)

    if (hasWikilink(body)) problems.push(`${path}: 本文に wikilink（[[）がある`)
    if (data.id >= NEW_POST_ID && /TODO/.test(`${data.title}\n${body}`))
      problems.push(`${path}: TODO が残っている`)
    for (const [, image] of body.matchAll(RELATIVE_IMAGE))
      if (!input.vaultImages.has(image))
        problems.push(`${path}: 本文の画像 ../images/${image} が vault にない`)
    for (const src of frontmatterImages(data)) {
      const image = src.slice('/images/'.length)
      if (!input.vaultImages.has(image) && !input.siteImage(image))
        problems.push(`${path}: frontmatter の画像 ${src} がどこにもない`)
    }
    published.push({ path, raw, data })
  }

  const images: string[] = []
  for (const [image, content] of input.vaultImages) {
    const site = input.siteImage(image)
    if (!site) images.push(image)
    else if (!site.equals(content))
      problems.push(
        `images/${image}: public/images/ に中身の違う同じ名前の画像がある`,
      )
  }

  const write = new Map<string, string>()
  const added: string[] = []
  const updated: string[] = []
  for (const { path, raw } of published) {
    const content = toSiteRaw(raw)
    const current = input.sitePosts.get(path)
    if (current === content) continue
    write.set(path, content)
    ;(current === undefined ? added : updated).push(path)
  }
  const publishedPaths = new Set(published.map(({ path }) => path))
  const removed = [...input.sitePosts.keys()].filter(
    (path) => !publishedPaths.has(path),
  )
  if (removed.length > MAX_REMOVE && !input.allowDelete)
    problems.push(
      `${removed.length} 本の記事が消える（上限 ${MAX_REMOVE}）。意図したときは --allow-delete を付ける`,
    )

  const { terms, termsChanged } = recountTerms(
    input.terms,
    published.map(({ data }) => data),
    problems,
  )
  return {
    problems,
    added,
    updated,
    removed,
    write,
    images,
    terms,
    termsChanged,
  }
}

/** count を記事から数え直し、JSON にないタームを足す */
function recountTerms(
  current: Record<Taxonomy, Term[]>,
  posts: PostData[],
  problems: string[],
) {
  const byId = new Map<number, { tax: Taxonomy; term: Term }>()
  for (const tax of TAXONOMIES)
    for (const term of current[tax]) byId.set(term.id, { tax, term })

  const counts = new Map<number, number>()
  const added = Object.fromEntries(
    TAXONOMIES.map((tax) => [tax, new Map<number, Term>()]),
  ) as Record<Taxonomy, Map<number, Term>>
  for (const post of posts) {
    const tax = TAXONOMY_OF[post.type]
    for (const { id, name, slug } of post.terms) {
      counts.set(id, (counts.get(id) ?? 0) + 1)
      const known =
        byId.get(id) ??
        (added[tax].has(id) ? { tax, term: added[tax].get(id)! } : undefined)
      const where = `${post.type}/${post.slug} のターム ${id}`
      if (!known) {
        if (id <= LEGACY_TERM_MAX_ID)
          problems.push(
            `${where}: 新しいタームの id は ${LEGACY_TERM_MAX_ID + 1} 以上にする`,
          )
        added[tax].set(id, { id, name, slug, count: 0 })
      } else if (known.tax !== tax) {
        problems.push(`${where}: id が ${known.tax} のタームと重なる`)
      } else if (known.term.name !== name || known.term.slug !== slug) {
        problems.push(
          `${where}: JSON では ${known.term.name}（${known.term.slug}）なのに ${name}（${slug}）`,
        )
      }
    }
  }

  const terms = {} as Record<Taxonomy, Term[]>
  const termsChanged: Taxonomy[] = []
  for (const tax of TAXONOMIES) {
    const list = sortTerms(
      [...current[tax], ...added[tax].values()].map((term) => ({
        ...term,
        count: counts.get(term.id) ?? 0,
      })),
    )
    terms[tax] = list
    if (JSON.stringify(list) !== JSON.stringify(current[tax]))
      termsChanged.push(tax)
  }
  return { terms, termsChanged }
}
