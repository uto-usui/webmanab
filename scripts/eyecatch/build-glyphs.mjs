// OGP の文字に使う Open Sans Bold Italic のアウトラインを src/lib/eyecatch/glyphs.json に書き出す。
// カテゴリ名に新しい文字を使うときだけ、CHARS に足して `pnpm build:glyphs` で作り直す
import fs from 'node:fs'
import { createRequire } from 'node:module'
import opentype from 'opentype.js'
import prettier from 'prettier'

const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-/:&+# '

const require = createRequire(import.meta.url)
const buf = fs.readFileSync(
  require.resolve('@fontsource/open-sans/files/open-sans-latin-700-italic.woff'),
)
const font = opentype.parse(
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
)
const upm = font.unitsPerEm
const n = (v) => String(Math.round(v))

const glyphs = {}
for (const ch of CHARS) {
  const glyph = font.charToGlyph(ch)
  // y 軸は下向き、em は 1000。toPathData は数を詰めるときに "238 0" を "2380" にすることがあるので自前で書く
  const d = glyph
    .getPath(0, 0, 1000)
    .commands.map((c) => {
      if (c.type === 'M' || c.type === 'L')
        return `${c.type}${n(c.x)} ${n(c.y)}`
      if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
      if (c.type === 'C')
        return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
      return 'Z'
    })
    .join('')
  glyphs[ch] = { d, adv: Math.round((glyph.advanceWidth * 1000) / upm) }
}

const out = {
  font: 'Open Sans Bold Italic (SIL OFL 1.1)',
  em: 1000,
  ascender: Math.round((font.ascender * 1000) / upm),
  capHeight: Math.round((font.tables.os2.sCapHeight * 1000) / upm),
  glyphs,
}
// format:check に合わせて prettier を通す。1 行の JSON から整形しないと、短いグリフの折り返しが変わって差分が出る
const file = new URL('../../src/lib/eyecatch/glyphs.json', import.meta.url)
fs.writeFileSync(
  file,
  await prettier.format(JSON.stringify(out), {
    ...(await prettier.resolveConfig(file)),
    parser: 'json',
  }),
)
console.log(`build-glyphs: ${Object.keys(glyphs).length} glyphs`)
