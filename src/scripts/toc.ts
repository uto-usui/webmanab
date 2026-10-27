// 旧サイトの vue-scrollto の設定（1000ms、cubic-bezier(1, 0, 0, 1)、上に 65px 空ける）を再現する
const DURATION = 1000
const OFFSET = 65
const ease = cubicBezier(1, 0, 0, 1)

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3
  return (x: number) => {
    // x(t) は単調増加なので二分探索で t を求める
    let lo = 0
    let hi = 1
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2
      if (at(x1, x2, mid) < x) lo = mid
      else hi = mid
    }
    return at(y1, y2, (lo + hi) / 2)
  }
}

// vue-scrollto と同じく、利用者がマウスやホイールで触ったら止める。
// 旧サイトは keyup でも止めていたが、Enter で選んだ直後に止まってしまうので入れない
const ABORT_EVENTS = ['mousedown', 'wheel', 'touchmove'] as const

function scrollToElement(target: HTMLElement) {
  // 行き先は押した時点で決める（vue-scrollto と同じ。目次が開く途中で押すとずれるのも同じ）
  const from = scrollY
  const to = target.getBoundingClientRect().top + scrollY - OFFSET
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scrollTo(0, to)
    return
  }
  let aborted = false
  const abort = () => {
    aborted = true
  }
  for (const type of ABORT_EVENTS) {
    addEventListener(type, abort, { passive: true, once: true })
  }
  const done = () => {
    for (const type of ABORT_EVENTS) removeEventListener(type, abort)
  }
  const start = performance.now()
  const step = (now: number) => {
    if (aborted) return done()
    const p = Math.min(1, (now - start) / DURATION)
    scrollTo(0, from + (to - from) * ease(p))
    if (p < 1) requestAnimationFrame(step)
    else done()
  }
  requestAnimationFrame(step)
}

for (const toc of document.querySelectorAll<HTMLElement>('.entry-toc')) {
  const list = toc.querySelector<HTMLElement>('.entry-toc__list')
  const title = toc.querySelector('.entry-toc__title')
  title?.addEventListener('click', () => {
    const open = toc.classList.toggle('is-open')
    toc.classList.add('has-opened')
    title.setAttribute('aria-expanded', String(open))
    if (list) list.inert = !open
  })
  list?.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    )
    const target = link && document.getElementById(link.hash.slice(1))
    if (!target) return
    event.preventDefault()
    scrollToElement(target)
  })
}

export {}
