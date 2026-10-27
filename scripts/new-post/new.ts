// vault に新しい記事の下書き（draft: true）を作る（F1）。
// node scripts/new-post/new.ts clip <url> [--tags a,b] [--no-full] [--out <dir>]
// node scripts/new-post/new.ts tip|lab <slug> [--tags a,b] [--out <dir>]
// node scripts/new-post/new.ts image <id> <file> [--out <dir>]
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import type { ImageRef } from '../export-markdown/image-manifest.ts'
import type { Term } from '../../src/lib/schema.ts'
import {
  POST_TYPES,
  TAXONOMIES,
  type PostType,
  type Taxonomy,
} from '../../src/lib/site.ts'
import { expectedFileName } from '../sync-vault/plan.ts'
import { readPosts, repoRoot, resolveVaultDir } from '../sync-vault/vault.ts'
import {
  clipSlug,
  nextPostId,
  postContent,
  readVault,
  resolveTerms,
  slugify,
} from './plan.ts'

const USAGE = `使い方:
  pnpm new clip <url> [--tags a,b] [--no-full]
  pnpm new tip <slug> [--tags a,b]
  pnpm new lab <slug> [--tags a,b]
  pnpm new image <id> <file>
どれも --out <dir> で書き先を変えられる（既定は WEBMANAB_VAULT_DIR）`

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  allowNegative: true,
  options: {
    tags: { type: 'string', default: '' },
    // 2026-10-27 に「ページ全体も毎回撮る」と決めた。崩れるサイトだけ --no-full で外す
    full: { type: 'boolean', default: true },
    out: { type: 'string' },
  },
})
const [command, target, file] = positionals
const fail = (message: string): never => {
  console.error(message)
  process.exit(1)
}
if (!command || !target) fail(USAGE)

const vault = resolveVaultDir(args.out, '--out')
const posts = readVault(readPosts(vault))

const writeNew = (to: string, content: string | Buffer) => {
  if (fs.existsSync(to)) fail(`${to} はもうあります。上書きしません`)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.writeFileSync(to, content)
}

// WebP は縦横 16383px までしか書けないので、それより長いページ全体のスクショは JPEG にする
const WEBP_MAX = 16383

/** scripts/export-markdown/images.ts と同じ大きさと品質で、幅 width までに縮めて書く */
async function webp(
  input: Buffer | string,
  dir: string,
  name: string,
  width: number,
  quality: number,
): Promise<ImageRef & { file: string }> {
  const meta = await sharp(input).metadata()
  const w = Math.min(width, meta.width)
  const tooTall = Math.round((meta.height * w) / meta.width) > WEBP_MAX
  const out = `${name}.${tooTall ? 'jpg' : 'webp'}`
  const resized = sharp(input).resize({ width: w })
  const buffer = await (
    tooTall
      ? resized.jpeg({ quality, mozjpeg: true })
      : resized.webp({ quality })
  ).toBuffer({ resolveWithObject: true })
  const to = path.join(vault, 'images', dir, out)
  writeNew(to, buffer.data)
  return {
    src: `/images/${dir}/${out}`,
    width: buffer.info.width,
    height: buffer.info.height,
    file: to,
  }
}

async function capture(url: string) {
  const browser = await chromium.launch()
  try {
    // 見出しはサムネイル 640×360 のちょうど 2 倍
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    })
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 })
    await page.evaluate(() => document.fonts.ready)
    // 入りのアニメーションが終わるのを待つ
    await page.waitForTimeout(3000)
    const title = (await page.title()).trim()
    const shot = await page.screenshot()
    let full: Buffer | undefined
    if (args.full) {
      // 遅延読み込みの画像を出すため、一度下までスクロールしてから撮る
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 720) {
          window.scrollTo(0, y)
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(1000)
      full = await page.screenshot({ fullPage: true })
    }
    return { title, shot, full }
  } finally {
    await browser.close()
  }
}

const readTerms = () =>
  Object.fromEntries(
    TAXONOMIES.map((tax) => [
      tax,
      JSON.parse(
        fs.readFileSync(
          path.join(repoRoot, 'src/content/terms', `${tax}.json`),
          'utf8',
        ),
      ),
    ]),
  ) as Record<Taxonomy, Term[]>

const obsidianUrl = (file: string) =>
  `obsidian://open?path=${encodeURIComponent(file)}`

if (command === 'image') {
  // pnpm new image <id> <file>: 本文の画像を images/posts/<id>/ に置き、貼る Markdown を出す
  const id = Number(target)
  if (!file) fail(USAGE)
  if (!posts.some((p) => p.id === id))
    fail(`id ${target} の記事が vault にありません`)
  const name = slugify(path.parse(file!).name) || 'image'
  const image = await webp(path.resolve(file!), `posts/${id}`, name, 1600, 80)
  console.log(image.file)
  console.log(`![](../images/posts/${id}/${path.basename(image.file)})`)
  process.exit(0)
}

if (!POST_TYPES.includes(command as PostType)) fail(USAGE)
const type = command as PostType
const template = path.join(vault, 'templates', `${type}.md`)
if (!fs.existsSync(template)) fail(`${template} がありません`)

const id = nextPostId(posts)
const tags = args.tags
  .split(',')
  .map((tag) => tag.trim())
  .filter(Boolean)
const { terms, created } = resolveTerms(tags, type, readTerms(), posts)

let content: string
let slug: string
const written: string[] = []
if (type === 'clip') {
  const url = target
  if (!URL.canParse(url) || !/^https?:/.test(url))
    fail(`${url} は http か https の URL ではありません`)
  const { title, shot, full } = await capture(url)
  const pageTitle = title || new URL(url).hostname
  slug = clipSlug(pageTitle, url, posts)
  const { file: thumbFile, src: thumb } = await webp(
    shot,
    'clip',
    `${id}-640`,
    640,
    75,
  )
  const { file: imageFile, ...image } = await webp(
    shot,
    'clip',
    `${id}`,
    1280,
    75,
  )
  written.push(imageFile, thumbFile)
  let fullImage: ImageRef | undefined
  if (full) {
    const { file: fullFile, ...rest } = await webp(
      full,
      'clip',
      `${id}-full`,
      1000,
      70,
    )
    written.push(fullFile)
    fullImage = rest
  }
  content = postContent({
    id,
    type,
    slug,
    title: pageTitle,
    date: new Date(),
    terms,
    body: fs.readFileSync(template, 'utf8'),
    clipUrl: url,
    image: { ...image, thumb },
    fullImage,
  })
} else {
  slug = target
  if (posts.some((p) => p.type === type && p.slug === slug))
    fail(`${type}/${slug} はもう vault にあります`)
  content = postContent({
    id,
    type,
    slug,
    title: 'TODO',
    date: new Date(),
    terms,
    body: fs.readFileSync(template, 'utf8'),
  })
}

const postFile = path.join(vault, type, expectedFileName({ slug, id }))
writeNew(postFile, content)
for (const term of created)
  console.log(`新しいターム: ${term.name}（id ${term.id}、slug ${term.slug}）`)
console.log(postFile)
for (const image of written) console.log(image)
console.log(obsidianUrl(postFile))
