import type { ListPage } from '../lib/list-json'
import { fill } from './fill-card'

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
