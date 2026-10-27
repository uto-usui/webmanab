const menu = document.querySelector<HTMLElement>('.menu')
const button = menu?.querySelector<HTMLButtonElement>('.menu__btn')
const inner = menu?.querySelector<HTMLElement>('.menu__inner')
// 開いている間は、メニューの外（ヘッダーや本文）に Tab も読み上げも行かないようにする（A11Y-13）
const outside = [
  ...(menu?.closest('.menu__wrapper')?.parentElement?.children ?? []),
].filter(
  (el): el is HTMLElement =>
    el instanceof HTMLElement && !el.classList.contains('menu__wrapper'),
)

function setOpen(open: boolean) {
  if (!menu || !button || !inner) return
  menu.classList.toggle('is-open', open)
  button.setAttribute('aria-expanded', String(open))
  inner.inert = !open
  for (const el of outside) el.inert = open
}

button?.addEventListener('click', () => {
  const open = !menu?.classList.contains('is-open')
  setOpen(open)
  if (open)
    inner?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true })
})

addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !menu?.classList.contains('is-open')) return
  setOpen(false)
  button?.focus()
})

// 戻るボタンで bfcache から戻ったときは、開いたままのページが出るので閉じる
addEventListener('pageshow', (event) => {
  if (event.persisted) setOpen(false)
})

export {}
