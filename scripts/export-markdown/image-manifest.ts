// images.ts が作る画像の対応表（images.json）の形と読み込み
import fs from 'node:fs'
import { imagesFile } from './paths.ts'

export interface ImageRef {
  src: string
  width: number
  height: number
}

export interface ImageManifest {
  // image.thumb は一覧のサムネイル用の 640px 版
  clips: Record<
    string,
    { image?: ImageRef & { thumb: string }; fullImage?: ImageRef }
  >
  // 本文の img の元の src → サイトの URL
  body: Record<string, string>
  missing: { post: string; src: string }[]
}

// 対応表がない環境（images.ts を走らせていない worktree など）では、画像を落として書き出す
export function readImageManifest(root: string): ImageManifest {
  const file = imagesFile(root)
  return fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : { clips: {}, body: {}, missing: [] }
}
