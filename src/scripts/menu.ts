const menu = document.querySelector<HTMLElement>('.menu')
const button = menu?.querySelector<HTMLButtonElement>('.menu__btn')
const inner = menu?.querySelector<HTMLElement>('.menu__inner')

function setOpen(open: boolean) {
  if (!menu || !button || !inner) return
  menu.classList.toggle('is-open', open)
  button.setAttribute('aria-expanded', String(open))
  inner.inert = !open
}

button?.addEventListener('click', () => {
  setOpen(!menu?.classList.contains('is-open'))
})

// 戻るボタンで bfcache から戻ったときは、開いたままのページが出るので閉じる
addEventListener('pageshow', (event) => {
  if (event.persisted) setOpen(false)
})

export {}
