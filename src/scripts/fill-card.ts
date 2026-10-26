import { thumbLink, titleLink } from '../components/article-item'
import type { ListItem } from '../lib/list-json'

// 複製した Article.astro のカードの中身を差し替える。無限スクロールと検索で使い、マークアップを Article.astro の 1 か所に保つ
export function fill(card: Element, item: ListItem) {
  const find = <T extends Element>(selector: string) => {
    const el = card.querySelector<T>(selector)
    if (!el) throw new Error(`カードに ${selector} がない`)
    return el
  }
  find('.article-item__tag').textContent = item.primaryTag
  const thumb = find<HTMLAnchorElement>('.article-item__img-wrap')
  thumb.href = item.path
  for (const name of ['aria-label', 'tabindex', 'aria-hidden'])
    thumb.removeAttribute(name)
  for (const [name, value] of Object.entries(thumbLink(item)))
    thumb.setAttribute(name, value)

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
