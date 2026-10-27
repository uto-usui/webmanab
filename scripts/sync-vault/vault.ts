// sync と F1（pnpm new）が共有する、vault の場所と記事の読み込み
import fs from 'node:fs'
import path from 'node:path'
import { POST_TYPES } from '../../src/lib/site.ts'
import type { VaultFile } from './plan.ts'

export const repoRoot = path.resolve(import.meta.dirname, '../..')

/** --vault / --out の値か、WEBMANAB_VAULT_DIR。どちらもなければ止める */
export function resolveVaultDir(arg: string | undefined, flag: string) {
  // 手元のパスを公開リポジトリに残さないよう、vault の場所は gitignore された .env に書く
  const envFile = path.join(repoRoot, '.env')
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile)
  const dir = arg ?? process.env.WEBMANAB_VAULT_DIR
  if (!dir) {
    console.error(
      `vault の場所を ${flag} か WEBMANAB_VAULT_DIR（.env に書ける）で渡してください`,
    )
    process.exit(1)
  }
  const vault = path.resolve(dir)
  if (!POST_TYPES.some((type) => fs.existsSync(path.join(vault, type)))) {
    console.error(
      `${vault} に ${POST_TYPES.join('/')} がありません。${flag} か WEBMANAB_VAULT_DIR で場所を渡してください`,
    )
    process.exit(1)
  }
  return vault
}

export const readPosts = (root: string): VaultFile[] =>
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
