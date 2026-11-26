// HTML の妥当性（08 の 1.5.1）。テンプレートの入れ子の誤り、閉じ忘れ、重複した属性などで止める
import { HtmlValidate } from 'html-validate'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { DIST, distFiles } from './dist.ts'

// 本文は作者が書いた HTML で、旧記事には見出しの飛び、jsfiddle や labobal.dev の iframe の width="100%" と
// frameborder、label のない input、p の中の div がある。どれも記事の書き方のことで、テンプレートの誤りではない。
// 本文の中ではこの規則だけを止めず、入れ子や閉じ忘れは本文でも見る
const AUTHORED_RULES = [
  'heading-level',
  'attribute-allowed-values',
  'no-deprecated-attr',
  'element-permitted-content',
  'input-missing-label',
]
const BODY_OPEN = '<div class="entry-content__inner">'

// document だけでは入れ子や重複した属性を見ないので、仕様に沿った standard と重ねる
const validator = new HtmlValidate({
  root: true,
  extends: ['html-validate:standard', 'html-validate:document'],
  rules: {
    // Google Fonts の CSS は UA ごとに中身が変わり integrity を付けられない。テンプレートの妥当性とも関係しない
    'require-sri': 'off',
    // 本文に差し込む disable-block は、違反のない記事では使われないまま終わる
    'no-unused-disable': 'off',
  },
})

test.each(distFiles('**/*.html'))('%s', async (file) => {
  const html = readFileSync(join(DIST, file), 'utf8').replace(
    BODY_OPEN,
    `${BODY_OPEN}<!-- [html-validate-disable-block ${AUTHORED_RULES.join(', ')}] -->`,
  )
  const report = await validator.validateString(html, file)
  const errors = report.results
    .flatMap((result) => result.messages)
    .map((m) => `${m.ruleId} ${m.selector ?? ''} ${m.message}`)
  expect(errors).toEqual([])
})
