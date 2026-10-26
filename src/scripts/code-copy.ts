// 本文のコードブロックの右上に copy のボタンを足す（#49）。JS がないときやクリップボードを使えないときは出さない。
// ボタンはマウスを載せたときだけ見せる（CSS）。ホバーのない端末では、ブロックをタップしたら見せる
const COPIED_MS = 2000

const blocks = document.querySelectorAll<HTMLElement>(
  '.entry-content__inner pre:has(> code)',
)

if (blocks.length && navigator.clipboard) {
  const status = document.createElement('span')
  status.className = 'is-sr-only'
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  // 末尾に置くと、本文で終わるページ（カタログ）で absolute の分だけページが伸びるので先頭に置く
  document.querySelector('.entry-content')?.prepend(status)

  for (const pre of blocks) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'code-copy'
    button.textContent = 'copy'
    let timer: number | undefined

    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(
        pre.querySelector('code')!.textContent,
      )
      button.textContent = 'copied'
      status.textContent = 'コードをコピーしました'
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        button.textContent = 'copy'
        status.textContent = ''
      }, COPIED_MS)
    })
    // pre は横にスクロールするので、包みを足してその右上に置く。pre の余白は CSS で包みに移る
    const wrap = document.createElement('div')
    wrap.className = 'code-copy-wrap'
    pre.replaceWith(wrap)
    wrap.append(pre, button)
    wrap.addEventListener('click', () => wrap.classList.add('is-active'))
  }
}

export {}
