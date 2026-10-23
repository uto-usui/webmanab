import { existsSync, globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const DIST = fileURLToPath(new URL('../../dist/', import.meta.url))

if (!existsSync(join(DIST, 'index.html'))) {
  throw new Error('dist/ がない。先に pnpm build を走らせる')
}

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

/** 開始タグを 1 つずつ返す。本文のコードはエスケープされているので拾わない */
export function startTags(html: string): string[] {
  return html.match(/<[a-zA-Z][^>]*>/g) ?? []
}
