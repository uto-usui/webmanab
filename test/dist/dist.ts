import { existsSync, globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const DIST = fileURLToPath(new URL('../../dist/', import.meta.url))

if (!existsSync(join(DIST, 'index.html'))) {
  throw new Error('dist/ がない。先に pnpm build を走らせる')
}

// ビルドと同じ値（astro.config.mjs と同じく、環境変数がなければ .env を読む）
try {
  process.loadEnvFile()
} catch {
  // .env がなければ環境変数だけを使う
}
if (!process.env.SITE_URL) throw new Error('SITE_URL が未設定です')
/** 末尾のスラッシュなし */
export const SITE_URL = process.env.SITE_URL.replace(/\/$/, '')

export const legacyPaths = new Set(
  readFileSync(new URL('../fixtures/legacy-urls.txt', import.meta.url), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((url) => decodeURIComponent(url)),
)

/** dist/ からの相対パス（区切りは /） */
export function distFiles(pattern: string): string[] {
  return globSync(pattern, { cwd: DIST }).sort()
}

export function readDist(file: string): string {
  return readFileSync(join(DIST, file), 'utf8')
}

/** `tip/foo/index.html` → `/tip/foo/` */
export function pagePath(file: string): string {
  return `/${file.replace(/index\.html$/, '')}`
}

/**
 * 開始タグを 1 つずつ返す。本文のコードはエスケープされているので拾わない。
 * 属性の値には > がそのまま入ることがある（description の「=>」など）ので、引用符の中は読み飛ばす
 */
export function startTags(html: string): string[] {
  return html.match(/<[a-zA-Z](?:[^>"']|"[^"]*"|'[^']*')*>/g) ?? []
}
