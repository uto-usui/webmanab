import {
  itemFromMeta,
  readQuery,
  SEARCH_PAGE_SIZE,
  statusText,
} from '../lib/search'
import { fill } from './fill-card'

type Result = { data: () => Promise<{ meta: Record<string, string> }> }
type Pagefind = {
  search: (
    q: string,
    options?: { filters?: Record<string, string> },
  ) => Promise<{ results: Result[] }>
}

const $ = <T extends Element>(selector: string) => {
  const el = document.querySelector<T>(selector)
  if (!el) throw new Error(`検索ページに ${selector} がない`)
  return el
}

const form = $<HTMLFormElement>('[data-search-form]')
const input = $<HTMLInputElement>('[data-search-input]')
const status = $<HTMLElement>('[data-search-status]')
const results = $<HTMLElement>('[data-search-results]')
const empty = $<HTMLElement>('[data-search-empty]')
const loader = $<HTMLElement>('[data-search-loader]')
const sentinel = $<HTMLElement>('[data-search-more]')
const source =
  $<HTMLTemplateElement>('[data-search-card]').content.firstElementChild!

// 種類を選び直したら、入力があればそのまま検索し直す（ページを読み直すので戻るでも戻れる）
form.addEventListener('change', (event) => {
  const target = event.target as HTMLInputElement
  if (target.name === 'type' && input.value.trim()) form.requestSubmit()
})

const { q, type } = readQuery(location.search)
input.value = q
// click() だと change が起きて送信し直すので、checked だけを変える
const radio = form.querySelector<HTMLInputElement>(
  `[name="type"][value="${type ?? ''}"]`,
)
if (radio) radio.checked = true

const run = async () => {
  loader.hidden = false
  status.textContent = '検索しています'
  // Vite に解決させない。dist/pagefind/ はビルドの最後に作る
  const path = '/pagefind/pagefind.js'
  const pagefind = (await import(/* @vite-ignore */ path)) as Pagefind
  const found = (
    await pagefind.search(q, type ? { filters: { type } } : undefined)
  ).results
  status.textContent = statusText(found.length)
  empty.hidden = found.length > 0

  let shown = 0
  let loading = false
  const more = async () => {
    loading = true
    loader.hidden = false
    const batch = await Promise.all(
      found
        .slice(shown, shown + SEARCH_PAGE_SIZE)
        .map((result) => result.data()),
    )
    for (const { meta } of batch) {
      const item = itemFromMeta(meta)
      if (!item) continue
      const card = source.cloneNode(true) as Element
      fill(card, item)
      results.append(card)
    }
    shown += batch.length
    loading = false
    loader.hidden = true
    if (shown >= found.length) {
      observer.disconnect()
    } else {
      // 足したあとも画面内に残っていると交差の変化がなく次が呼ばれないので、監視をやり直す
      observer.unobserve(sentinel)
      observer.observe(sentinel)
    }
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!loading && entries.some((entry) => entry.isIntersecting)) void more()
    },
    { rootMargin: '0px 0px 100px 0px' },
  )
  loader.hidden = true
  // 最初の 8 件はすぐ出す。続きは下まで来たら読む
  if (found.length) {
    await more()
    if (shown < found.length) observer.observe(sentinel)
  }
}

if (q) {
  run().catch((error: unknown) => {
    loader.hidden = true
    status.textContent = '検索を読み込めませんでした'
    console.warn('検索を読み込めませんでした', error)
  })
}
