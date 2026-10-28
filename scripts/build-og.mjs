// prebuild: カテゴリごとの OGP を PNG にして public/og/{key}.png に書く。
// Netlify で @resvg/resvg-js（ネイティブ）が動かなければ @resvg/resvg-wasm に差し替える
import fs from 'node:fs'
import { Resvg } from '@resvg/resvg-js'
import { renderOgp } from '../src/lib/eyecatch/index.ts'
import { EYECATCH_KEYS } from '../src/lib/primary-tag.ts'

const out = new URL('../public/og/', import.meta.url)
const t0 = performance.now()
// カテゴリを消したときに古い PNG が残らないよう、毎回作り直す
fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })
let bytes = 0
for (const key of EYECATCH_KEYS) {
  // 文字はパスで埋め込んでいるので、システムのフォントは読まない
  const png = new Resvg(renderOgp(key), { font: { loadSystemFonts: false } })
    .render()
    .asPng()
  fs.writeFileSync(new URL(`${key}.png`, out), png)
  bytes += png.length
}
console.log(
  `build-og: ${EYECATCH_KEYS.length} files, ${Math.round(bytes / 1024)}KB, ${Math.round(performance.now() - t0)}ms`,
)
