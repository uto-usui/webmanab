// Open Sans Bold Italic から ASCII のグリフを path にして JSON に書き出す（一度だけ実行）
import fs from 'node:fs'
import { createRequire } from 'node:module'
import opentype from 'opentype.js'

const require = createRequire(import.meta.url)
const file = require.resolve('@fontsource/open-sans/files/open-sans-latin-700-italic.woff')
const buf = fs.readFileSync(file)
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-/:&+# '
const upm = font.unitsPerEm
const glyphs: Record<string, { d: string; adv: number }> = {}
for (const ch of chars) {
  const g = font.charToGlyph(ch)
  // y 軸を下向き、em を 1000 に正規化。座標は整数に丸める
  const p = g.getPath(0, 0, 1000)
  // toPathData は数を詰めるときに "238 0" を "2380" にしてしまうことがあるので自前で書き出す
  const n = (v: number) => String(Math.round(v))
  const d = p.commands
    .map((c: any) =>
      c.type === 'M' || c.type === 'L' ? `${c.type}${n(c.x)} ${n(c.y)}`
      : c.type === 'Q' ? `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
      : c.type === 'C' ? `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
      : 'Z')
    .join('')
  glyphs[ch] = { d, adv: Math.round((g.advanceWidth! * 1000) / upm) }
}
const out = { font: 'Open Sans Bold Italic (SIL OFL 1.1)', em: 1000, ascender: Math.round((font.ascender * 1000) / upm), capHeight: Math.round(((font.tables.os2 as any).sCapHeight * 1000) / upm), glyphs }
fs.writeFileSync(new URL('./glyphs.json', import.meta.url), JSON.stringify(out))
console.log('glyphs', Object.keys(glyphs).length, 'bytes', JSON.stringify(out).length, 'capHeight', out.capHeight)
