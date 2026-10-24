// 本文の画像（public/images/ に置いたもの）に width / height を付け、読み込みでレイアウトがずれないようにする。
// Markdown の ![alt](src) では大きさを書けないので、描画のときにファイルから読む
import fs from 'node:fs'
import path from 'node:path'
import { imageSize } from 'image-size'
import { defineHastPlugin } from 'satteri'

const publicDir = path.resolve(import.meta.dirname, '../../../public')
const cache = new Map()

export const imageDimensions = (src) => {
  if (!cache.has(src)) {
    const { width, height } = imageSize(
      fs.readFileSync(path.join(publicDir, src)),
    )
    cache.set(src, { width, height })
  }
  return cache.get(src)
}

export const imageSizePlugin = defineHastPlugin({
  name: 'webmanab-image-size',
  element: {
    filter: ['img'],
    visit(node, ctx) {
      const { src } = node.properties ?? {}
      if (typeof src !== 'string' || !src.startsWith('/images/')) return
      const { width, height } = imageDimensions(src)
      ctx.setProperty(node, 'width', width)
      ctx.setProperty(node, 'height', height)
      ctx.setProperty(node, 'loading', 'lazy')
      ctx.setProperty(node, 'decoding', 'async')
    },
  },
})
