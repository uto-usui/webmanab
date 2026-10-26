// HTML の妥当性（08 の 1.5.1）。テンプレートの入れ子の誤り、閉じ忘れ、重複した属性などで止める
import { HtmlValidate } from 'html-validate'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import allowedByPage from './html-validate-allowed.json' with { type: 'json' }
import { DIST, distFiles } from './dist.ts'

// document だけでは入れ子や重複した属性を見ないので、仕様に沿った standard と重ねる
const validator = new HtmlValidate({
  root: true,
  extends: ['html-validate:standard', 'html-validate:document'],
  rules: {
    // Google Fonts の CSS は UA ごとに中身が変わり integrity を付けられない。テンプレートの妥当性とも関係しない
    'require-sri': 'off',
  },
})

// 本文の生 HTML と Markdown から来る違反の、記事ごと・規則ごとの件数（本文は直さない）。
// 見出しの飛び（A11Y-09）、jsfiddle の iframe の width="100%" と frameborder、
// デモの input の label、div の中の style（tip/html5-global、tip/transition）。
// 件数がずれたら止まるので、記事を直したらこのファイルも直す
const ALLOWED: Record<string, Record<string, number>> = allowedByPage

test.each(distFiles('**/*.html'))('%s', async (file) => {
  const report = await validator.validateFile(join(DIST, file))
  const counts: Record<string, number> = {}
  const errors: string[] = []
  for (const m of report.results.flatMap((result) => result.messages)) {
    counts[m.ruleId] = (counts[m.ruleId] ?? 0) + 1
    errors.push(`${m.ruleId} ${m.selector ?? ''} ${m.message}`)
  }
  // 許可した件数と規則ごとに同じなら通す。違えば違反の中身を添えて止める
  expect(counts, errors.join('\n')).toEqual(ALLOWED[file] ?? {})
})
