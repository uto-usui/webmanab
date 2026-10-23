import { titleLink } from '../components/article-item'
import type { ListItem, ListPage } from '../lib/list-json'

// 1 件目のカードを複製して中身を差し替える。マークアップを Article.astro の 1 か所に保つため
function fill(card: Element, item: ListItem) {
  const find = <T extends Element>(selector: string) => {
    const el = card.querySelector<T>(selector)
    if (!el) throw new Error(`カードに ${selector} がない`)
    return el
  }
  find('.article-item__tag').textContent = item.primaryTag
  find<HTMLAnchorElement>('.article-item__img-wrap').href = item.path

  const img = find<HTMLImageElement>('.article-item__img > img')
  img.dataset.lazy = 'loading'
  img.src = item.eyecatch

  const target = find<HTMLAnchorElement>('.article-item__target')
  const link = titleLink(item)
  target.href = link.href
  if (link.external) {
    target.target = '_blank'
    target.rel = 'noopener'
  } else {
    target.removeAttribute('target')
    target.removeAttribute('rel')
  }
  target.textContent = item.title

  const time = find<HTMLTimeElement>('.article-item__time')
  time.dateTime = item.dateLabel
  time.textContent = item.dateLabel
}

function setup(list: HTMLElement) {
  const { endpoint } = list.dataset
  const lastPage = Number(list.dataset.lastPage)
  const endAfterLast = list.dataset.endAfterLast === 'true'
  const inner = list.querySelector('.article-list__inner')
  const container = list.querySelector('.infinite-loading-container')
  const loader = list.querySelector<HTMLElement>('[data-infinite-loader]')
  const end = list.querySelector<HTMLElement>('[data-infinite-end]')
  // 0 件の一覧には複製元がないが、続きを読まずに End を出すだけなので使わない
  const source = inner?.querySelector('.article-item')
  if (!endpoint || !inner || !container || !loader || !end) return

  let page = 1
  let loading = false

  // 旧来の規則: 合計が 8 の倍数なら End を出し、そうでなければ読み込み口ごと消す
  const finish = () => {
    observer.disconnect()
    if (endAfterLast) end.hidden = false
    else container.remove()
  }

  const load = async () => {
    loading = true
    loader.hidden = false
    try {
      const res = await fetch(`${endpoint}${page + 1}.json`)
      if (!res.ok) throw new Error(`${res.status} ${res.url}`)
      const data = (await res.json()) as ListPage
      if (!source) throw new Error('複製するカードがない')
      for (const item of data.items) {
        const card = source.cloneNode(true) as Element
        fill(card, item)
        inner.append(card)
      }
      page += 1
      if (page >= lastPage) {
        finish()
      } else {
        // 足したあとも読み込み口が画面内に残っていると、交差の変化がなく次が呼ばれないので監視をやり直す
        observer.unobserve(container)
        observer.observe(container)
      }
    } catch (error) {
      // 読み込み口は残す。画面から外れてまた入ったときに読み直す
      console.warn('一覧の続きを読み込めませんでした', error)
    } finally {
      loading = false
      loader.hidden = true
    }
  }

  // 旧来は読み込み口の上端が画面の下端から 100px 以内に入ったら次を読んでいた
  const observer = new IntersectionObserver(
    (entries) => {
      if (loading || !entries.some((entry) => entry.isIntersecting)) return
      if (page >= lastPage) finish()
      else void load()
    },
    { rootMargin: '0px 0px 100px 0px' },
  )
  observer.observe(container)
}

for (const list of document.querySelectorAll<HTMLElement>(
  '.article-list[data-endpoint]',
)) {
  setup(list)
}
