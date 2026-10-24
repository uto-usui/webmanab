const header = document.querySelector<HTMLElement>('.header')
const inner = header?.querySelector<HTMLElement>('.header__inner')
const desktop = matchMedia('(min-width: 1080px)')
let queued = false

function update() {
  queued = false
  const fixed = desktop.matches && scrollY > 45
  header?.classList.toggle('is-fixed', fixed)
  inner?.classList.toggle('is-fixed', fixed)
}

function schedule() {
  if (queued) return
  queued = true
  requestAnimationFrame(update)
}

addEventListener('scroll', schedule, { passive: true })
desktop.addEventListener('change', schedule)
update()

export {}
