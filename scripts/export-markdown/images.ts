// 旧 WordPress の uploads から、clip のスクショと本文の画像を public/images に書き出し、対応表 images.json を作る。
// export.ts はこの対応表を読んで frontmatter と本文の画像を書く。
// node scripts/export-markdown/images.ts --uploads <dir> [--uploads <dir> ...] [--snapshot <dir>]
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import sharp from 'sharp'
import { imagesFile, repoRoot, snapshotHtmlDir } from './paths.ts'
import type { ImageManifest, ImageRef } from './image-manifest.ts'
import { loadSnapshot } from './snapshot.ts'

const { values: args } = parseArgs({
  options: {
    snapshot: { type: 'string' },
    // uploads は 1 か所に揃っていないので、複数の置き場所を順に探す
    uploads: { type: 'string', multiple: true, default: [] },
  },
})
if (!args.uploads.length) throw new Error('--uploads <dir> を渡してください')
const uploads = args.uploads.map((d) => path.resolve(d))

// 外部に置いていた画像は、uploads と同じ形のパスで置いた写しを使う
const EXTERNAL: Record<string, string> = {
  'https://lh3.googleusercontent.com/iwfhMiPniSkp6l8uEzbYS6RZ9_KZof1tlpXYQiQDeRcjbH1UCQ8kac-dveMSHE0YphUSPoMopE2s_ofdccj_VQvxE8of4FElTBo6Qv9fHYKk_wuwZwHluy3sxS5hPWJUUCwDWibp5nBm3xJzz9pDxkaB0ND1EoyjTUHRZ0Zugk5CInzqQyR23AccXX7fwvit907C3aHNedBkbnG5vEbqqkmCN1U82Kt0jP7kLcVtEoFLFfmFITrCnnPnAK5S7w6oiStLbGwc5WQZjbNAJLSrX4rumeaK6HK1Pa6j0vQZVVrXU_4hRoV_6k8NYDL3v5nF6Ma4LBL6noHZIxPF3yr2waK3xTFpR2OTlv0YnVLiYwyPspTRDCavFdx86VEggHv5cGeLGKB2u1w_MZ_bpo1_5BfhNHMDDRGgEYIGLEZjlWxpdATTT09-oyxNr2AOuvRmYXIw6Dx-Z8tyzB6Q8lw-rmNTEgsTjrlGHV713KevXqlRUeJ6bKEB8Ir_noj_cQ_ate79uiVyHc4_0W_wQ0-EGTFJAZDtngBz-n7fjQJ07-QJf5Xrf4m6TnYKRIOM8j36lKMVKfuhO_M5vBtuprDv_YC70TmqwM02jJ4nkxWaVsnfPgp0YG13HKMliNgsyS1rZqOP2USZLDogn_4yZ8p4oWqRWXOnQ6AyDpdcNdQsAok=s649-no':
    '2017/02/hue-circle.jpg',
}

// uploads の中のパス（2017/01/tuesday.png）。ホスト名の打ち間違い（wp.ebmanab-html.com）もここで吸収する
const uploadPath = (url: string) =>
  EXTERNAL[url] ?? url.match(/\/wp-content\/uploads\/(.+)$/)?.[1]

const findUpload = (rel: string) =>
  uploads.map((d) => path.join(d, rel)).find((f) => fs.existsSync(f))

const publicDir = path.join(repoRoot, 'public')
const clipDir = path.join(publicDir, 'images/clip')
const bodyDir = path.join(publicDir, 'images/uploads')

// WebP は縦横 16383px までしか書けないので、それより長いページ全体のスクショは JPEG にする
const WEBP_MAX = 16383

// 一覧のサムネイルは 640px、記事ページと前後記事は 1280px まで。ページ全体のスクショは本文の幅（920px）に合わせて 1000px まで
async function webp(
  file: string,
  name: string,
  width: number,
  quality: number,
): Promise<ImageRef> {
  const meta = await sharp(file).metadata()
  const w = Math.min(width, meta.width)
  const tooTall = Math.round((meta.height * w) / meta.width) > WEBP_MAX
  const out = `${name}.${tooTall ? 'jpg' : 'webp'}`
  const resized = sharp(file).resize({ width: w })
  const info = await (
    tooTall
      ? resized.jpeg({ quality, mozjpeg: true })
      : resized.webp({ quality })
  ).toFile(path.join(clipDir, out))
  return { src: `/images/clip/${out}`, width: info.width, height: info.height }
}

const manifest: ImageManifest = { clips: {}, body: {}, missing: [] }
fs.rmSync(clipDir, { recursive: true, force: true })
fs.rmSync(bodyDir, { recursive: true, force: true })
fs.mkdirSync(clipDir, { recursive: true })

const posts = loadSnapshot(snapshotHtmlDir(args.snapshot))
for (const p of posts) {
  const key = `${p.type}/${decodeURIComponent(p.slug)}`
  const source = (url: string | undefined) => {
    if (!url) return undefined
    const file = uploadPath(url) && findUpload(uploadPath(url)!)
    if (!file) manifest.missing.push({ post: key, src: url })
    return file
  }

  if (p.type === 'clip') {
    const entry: ImageManifest['clips'][string] = {}
    const featured = source(p.featuredImage)
    if (featured) {
      const thumb = await webp(featured, `${p.id}-640`, 640, 75)
      entry.image = {
        ...(await webp(featured, `${p.id}`, 1280, 75)),
        thumb: thumb.src,
      }
    }
    const full = source(p.clipImage || undefined)
    if (full) entry.fullImage = await webp(full, `${p.id}-full`, 1000, 70)
    if (entry.image || entry.fullImage) manifest.clips[p.id] = entry
  }

  for (const [, src] of (p.content ?? '').matchAll(
    /<img[^>]*\ssrc="([^"]+)"/g,
  )) {
    const file = source(src)
    if (!file) continue
    const rel = uploadPath(src)!
    fs.mkdirSync(path.dirname(path.join(bodyDir, rel)), { recursive: true })
    fs.copyFileSync(file, path.join(bodyDir, rel))
    manifest.body[src] = `/images/uploads/${rel}`
  }
}

fs.writeFileSync(imagesFile(repoRoot), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(
  `clip: ${Object.keys(manifest.clips).length} 件、本文: ${Object.keys(manifest.body).length} 枚、見つからない: ${manifest.missing.length} 枚`,
)
for (const m of manifest.missing) console.log(`  ${m.post} ${m.src}`)
