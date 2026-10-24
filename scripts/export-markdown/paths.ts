import fs from 'node:fs'
import path from 'node:path'

export const repoRoot = path.resolve(import.meta.dirname, '../..')

// .snapshot はコミットしない場所なので、worktree などでは --snapshot か SNAPSHOT_DIR で渡す
export function snapshotHtmlDir(arg: string | undefined): string {
  const dir = path.resolve(
    arg ?? process.env.SNAPSHOT_DIR ?? path.join(repoRoot, '.snapshot'),
  )
  const html = path.join(dir, 'html')
  if (!fs.existsSync(html)) {
    throw new Error(
      `${html} がありません。--snapshot <dir> か SNAPSHOT_DIR で .snapshot の場所を渡してください`,
    )
  }
  return html
}

export const postsDir = (root: string) => path.join(root, 'src/content/posts')
export const termsDir = (root: string) => path.join(root, 'src/content/terms')
export const reportFile = (root: string) =>
  path.join(root, 'scripts/export-markdown/report.json')
export const imagesFile = (root: string) =>
  path.join(root, 'scripts/export-markdown/images.json')
