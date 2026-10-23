// prebuild: カテゴリごとの OGP を PNG にして public/og/{key}.png に書く
// @resvg/resvg-js（ネイティブ）を使う。Netlify で動かなかったときは下の wasm 版に差し替える
import fs from 'node:fs'
import { Resvg } from '@resvg/resvg-js'
import { renderOgp } from '../src/index.ts'
import { CATEGORIES } from '../src/categories.ts'

const out = process.argv[2] ?? 'public/og'
fs.mkdirSync(out, { recursive: true })
for (const key of [...CATEGORIES, 'generic-tip', 'generic-clip', 'generic-lab']) {
  fs.writeFileSync(`${out}/${key}.png`, new Resvg(renderOgp(key), { font: { loadSystemFonts: false } }).render().asPng())
}

// wasm 版（@resvg/resvg-wasm）にするときは、import と描画の 2 か所をこう変える:
//   import { createRequire } from 'node:module'
//   import { initWasm, Resvg } from '@resvg/resvg-wasm'
//   await initWasm(fs.readFileSync(createRequire(import.meta.url).resolve('@resvg/resvg-wasm/index_bg.wasm')))
//   new Resvg(svg).render().asPng()   // wasm 版にはシステムフォントの読み込みがないので font の指定は要らない
