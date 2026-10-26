// はみ出して横にスクロールするコードに Tab で止まれるようにし、矢印キーで動かせるようにする（A11Y-06）。
// はみ出すかは幅で変わるので、大きさが変わるたびに見直す
const scrollers = [
  ...document.querySelectorAll<HTMLElement>(
    '.entry-content__inner pre, .entry-content__inner pre > code',
  ),
].filter((el) => /auto|scroll/.test(getComputedStyle(el).overflowX))

const update = (el: HTMLElement) => {
  if (el.scrollWidth > el.clientWidth) el.tabIndex = 0
  else el.removeAttribute('tabindex')
}

const observer = new ResizeObserver((entries) => {
  for (const { target } of entries) update(target as HTMLElement)
})
for (const el of scrollers) observer.observe(el)

export {}
