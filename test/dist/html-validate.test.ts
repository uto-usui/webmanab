// HTML の妥当性（08 の 1.5.1）。テンプレートの入れ子の誤り、閉じ忘れ、重複した属性などで止める
import { HtmlValidate } from 'html-validate'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { DIST, distFiles } from './dist.ts'

// document だけでは入れ子や重複した属性を見ないので、仕様に沿った standard と重ねる
const validator = new HtmlValidate({
  root: true,
  extends: ['html-validate:standard', 'html-validate:document'],
})

// 本文の生 HTML から来る既知の違反を、ページごとに「ページ: [規則]」で書く（手順 6 で埋める）
const ALLOWED: Record<string, string[]> = {}

test.each(distFiles('**/*.html'))('%s', async (file) => {
  const report = await validator.validateFile(join(DIST, file))
  const allowed = ALLOWED[file] ?? []
  const errors = report.results
    .flatMap((result) => result.messages)
    .filter((m) => !allowed.includes(m.ruleId ?? ''))
    .map((m) => `${m.line}:${m.column} ${m.ruleId} ${m.message}`)
  expect(errors).toEqual([])
})
