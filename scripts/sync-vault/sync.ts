// vault の Published/webmanab/ から、公開する記事と画像を webmanab に写す（vault から webmanab への一方向）。
// node scripts/sync-vault/sync.ts [--vault <dir>] [--dry-run] [--allow-delete]
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'
import type { Term } from '../../src/lib/schema.ts'
import { POST_TYPES, TAXONOMIES, type Taxonomy } from '../../src/lib/site.ts'
import { planSync, type VaultFile } from './plan.ts'

const { values: args } = parseArgs({
  options: {
    vault: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    'allow-delete': { type: 'boolean', default: false },
  },
})

const repoRoot = path.resolve(import.meta.dirname, '../..')
const vault = path.resolve(
  args.vault ??
    process.env.WEBMANAB_VAULT_DIR ??
    path.join(
      os.homedir(),
      'vault/Published/webmanab',
    ),
)
const postsDir = path.join(repoRoot, 'src/content/posts')
const termsDir = path.join(repoRoot, 'src/content/terms')
const publicImages = path.join(repoRoot, 'public/images')

if (!POST_TYPES.some((type) => fs.existsSync(path.join(vault, type)))) {
  console.error(
    `${vault} に ${POST_TYPES.join('/')} がありません。--vault か WEBMANAB_VAULT_DIR で場所を渡してください`,
  )
  process.exit(1)
}

const readPosts = (root: string): VaultFile[] =>
  POST_TYPES.flatMap((type) => {
    const dir = path.join(root, type)
    if (!fs.existsSync(dir)) return []
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => ({
        path: `${type}/${file}`,
        raw: fs.readFileSync(path.join(dir, file), 'utf8'),
      }))
  })

const vaultImages = new Map<string, Buffer>()
const imagesDir = path.join(vault, 'images')
if (fs.existsSync(imagesDir))
  for (const entry of fs.readdirSync(imagesDir, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile() || entry.name.startsWith('.')) continue
    const file = path.join(entry.parentPath, entry.name)
    vaultImages.set(
      path.relative(imagesDir, file).split(path.sep).join('/'),
      fs.readFileSync(file),
    )
  }

const terms = Object.fromEntries(
  TAXONOMIES.map((tax) => [
    tax,
    JSON.parse(fs.readFileSync(path.join(termsDir, `${tax}.json`), 'utf8')),
  ]),
) as Record<Taxonomy, Term[]>

const plan = planSync({
  vaultPosts: readPosts(vault),
  vaultImages,
  sitePosts: new Map(readPosts(postsDir).map(({ path, raw }) => [path, raw])),
  siteImage: (image) => {
    const file = path.join(publicImages, image)
    return fs.existsSync(file) ? fs.readFileSync(file) : undefined
  },
  terms,
  allowDelete: args['allow-delete'],
})

if (plan.problems.length) {
  console.error(`止めました。何も書いていません（${plan.problems.length} 件）`)
  for (const problem of plan.problems) console.error(`- ${problem}`)
  process.exit(1)
}

const list = (label: string, items: string[]) => {
  console.log(`${label} ${items.length}`)
  for (const item of items) console.log(`  ${item}`)
}
list('追加', plan.added)
list('更新', plan.updated)
list('削除', plan.removed)
list('画像', plan.images)
list('ターム', plan.termsChanged)

if (args['dry-run']) process.exit(0)

for (const [file, content] of plan.write) {
  fs.mkdirSync(path.dirname(path.join(postsDir, file)), { recursive: true })
  fs.writeFileSync(path.join(postsDir, file), content)
}
for (const file of plan.removed) fs.rmSync(path.join(postsDir, file))
for (const image of plan.images) {
  const to = path.join(publicImages, image)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(path.join(imagesDir, image), to)
}
for (const tax of plan.termsChanged)
  fs.writeFileSync(
    path.join(termsDir, `${tax}.json`),
    `${JSON.stringify(plan.terms[tax], null, 2)}\n`,
  )
console.log('書きました。pnpm test で確かめてからコミットしてください')
