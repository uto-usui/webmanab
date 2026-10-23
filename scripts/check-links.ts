// 記事の外部リンクの死活を調べて一覧を出す（08 の 1.3、README 3 章の 17）。
// 一覧を出すだけで、記事もリンクも直さない。合否はないので、調べ終われば終了コードは 0。
// 使い方: node scripts/check-links.ts [--dir src/content/posts] [--list] [--limit N]
//   --list  取り出した URL の件数だけを出し、通信しない
import { appendFileSync, globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { parse as parseYaml } from 'yaml'

export type Field = 'clipUrl' | 'demoUrl' | 'link' | 'iframe'

export interface Found {
  field: Field
  url: string
}

export type Verdict = 'ok' | 'redirected' | 'broken' | 'unverifiable'

export interface Checked {
  verdict: Verdict
  detail: string
  finalUrl?: string
}

const TIMEOUT_MS = 10_000
const CONCURRENCY = 4
const USER_AGENT = 'Mozilla/5.0 (compatible; webmanab-link-check)'

// # 以降はサーバーに送られないので外して、同じページを 1 回だけ調べる
function normalize(raw: string): string | null {
  const url = raw.trim().replace(/&amp;/g, '&').replace(/#.*$/, '')
  const full = url.startsWith('//') ? `https:${url}` : url
  return /^https?:\/\//i.test(full) ? full : null
}

/** 記事の Markdown から外部の URL を取り出す。コードの中は対象にしない */
export function extractLinks(markdown: string): Found[] {
  const found: Found[] = []
  const push = (field: Field, raw: unknown) => {
    const url = typeof raw === 'string' ? normalize(raw) : null
    if (url) found.push({ field, url })
  }

  const fm = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  const data = fm ? (parseYaml(fm[1]) ?? {}) : {}
  push('clipUrl', data.clipUrl)
  push('demoUrl', data.demoUrl)

  const body = (fm ? markdown.slice(fm[0].length) : markdown)
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '')
    .replace(/(`+)[\s\S]*?\1/g, '')
  for (const m of body.matchAll(/\]\(\s*<?([^)\s>]+)/g)) push('link', m[1])
  for (const m of body.matchAll(/<(https?:\/\/[^>\s]+)>/g)) push('link', m[1])
  for (const m of body.matchAll(/<a\s[^>]*?href="([^"]+)"/gi))
    push('link', m[1])
  for (const m of body.matchAll(/<iframe\s[^>]*?src="([^"]+)"/gi))
    push('iframe', m[1])
  return found
}

const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '')

/** 応答を 4 つに分ける。403 と 429 はボットを弾いていることが多いので「確かめられない」にする */
type Outcome =
  { status: number; url: string } | { error: string; code?: string }

export function classify(url: string, res: Outcome): Checked {
  if ('error' in res) {
    if (res.code === 'ENOTFOUND' || res.code === 'EAI_AGAIN')
      return { verdict: 'broken', detail: 'DNS が引けない' }
    if (res.code === 'ECONNREFUSED')
      return { verdict: 'broken', detail: '接続を拒否された' }
    if (/CERT|SSL|TLS/i.test(res.code ?? ''))
      return { verdict: 'broken', detail: `証明書のエラー（${res.code}）` }
    if (res.code === 'TIMEOUT')
      return { verdict: 'unverifiable', detail: 'タイムアウト' }
    return { verdict: 'unverifiable', detail: res.code ?? res.error }
  }
  if (res.status === 403 || res.status === 429)
    return { verdict: 'unverifiable', detail: String(res.status) }
  if (res.status >= 400)
    return { verdict: 'broken', detail: String(res.status) }
  if (hostOf(res.url) !== hostOf(url))
    return {
      verdict: 'redirected',
      detail: String(res.status),
      finalUrl: res.url,
    }
  return { verdict: 'ok', detail: String(res.status) }
}

async function request(url: string, method: 'HEAD' | 'GET'): Promise<Outcome> {
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      headers: { 'user-agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    await res.body?.cancel()
    return { status: res.status, url: res.url }
  } catch (e) {
    const err = e as Error & { cause?: { code?: string } }
    const code = err.name === 'TimeoutError' ? 'TIMEOUT' : err.cause?.code
    return { error: err.message, code }
  }
}

export async function check(url: string): Promise<Checked> {
  const head = await request(url, 'HEAD')
  // HEAD を受け付けないサーバーがあるので、だめなら GET で取り直す
  const ok = 'status' in head && head.status < 400
  return classify(url, ok ? head : await request(url, 'GET'))
}

/** 同じホストへは同時 1 本、全体で同時 CONCURRENCY 本まで */
async function checkAll(urls: string[]): Promise<Map<string, Checked>> {
  const byHost = new Map<string, string[]>()
  for (const url of urls) {
    const host = new URL(url).hostname
    byHost.set(host, [...(byHost.get(host) ?? []), url])
  }
  const queues = [...byHost.values()]
  const results = new Map<string, Checked>()
  const worker = async () => {
    for (let queue = queues.shift(); queue; queue = queues.shift()) {
      for (const url of queue) results.set(url, await check(url))
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  return results
}

const LABEL: Record<Exclude<Verdict, 'ok'>, string> = {
  broken: '切れている（DNS が引けない、4xx、5xx など）',
  redirected: '別のホストに転送されている（持ち主が変わっていないか見る）',
  unverifiable: '確かめられない（タイムアウト、403 など）',
}

export function toMarkdown(
  sources: Map<string, string[]>,
  results: Map<string, Checked>,
): string {
  const lines = ['## 外部リンクの死活', '']
  const count = (v: Verdict) =>
    [...results.values()].filter((r) => r.verdict === v).length
  lines.push(
    `${results.size} 件を調べた。問題なし ${count('ok')}、切れている ${count('broken')}、別のホストへの転送 ${count('redirected')}、確かめられない ${count('unverifiable')}`,
    '',
  )
  for (const verdict of ['broken', 'redirected', 'unverifiable'] as const) {
    const rows = [...results].filter(([, r]) => r.verdict === verdict)
    if (rows.length === 0) continue
    lines.push(`### ${LABEL[verdict]}: ${rows.length} 件`, '')
    lines.push('| URL | 状態 | 転送先 | 記事 |', '| --- | --- | --- | --- |')
    for (const [url, r] of rows) {
      lines.push(
        `| ${url} | ${r.detail} | ${r.finalUrl ?? ''} | ${sources.get(url)!.join('<br>')} |`,
      )
    }
    lines.push('')
  }
  return lines.join('\n')
}

async function main() {
  const { values } = parseArgs({
    options: {
      dir: { type: 'string', default: 'src/content/posts' },
      list: { type: 'boolean', default: false },
      limit: { type: 'string' },
    },
  })
  // URL → 出てくる記事と欄（"tip/foo.md (link)"）
  const sources = new Map<string, string[]>()
  const fields = new Map<Field, Set<string>>()
  for (const file of globSync('**/*.md', { cwd: values.dir }).sort()) {
    const markdown = readFileSync(join(values.dir, file), 'utf8')
    for (const { field, url } of extractLinks(markdown)) {
      sources.set(url, [...(sources.get(url) ?? []), `${file} (${field})`])
      fields.set(field, (fields.get(field) ?? new Set()).add(url))
    }
  }
  const counts = [...fields].map(([f, s]) => `${f} ${s.size}`).join('、')
  console.log(`${values.dir}: 重複を除いて ${sources.size} 件（${counts}）`)
  if (values.list) return

  const urls = [...sources.keys()].slice(
    0,
    values.limit ? Number(values.limit) : undefined,
  )
  const md = toMarkdown(sources, await checkAll(urls))
  console.log(`\n${md}`)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, md)
}

if (import.meta.main) await main()
