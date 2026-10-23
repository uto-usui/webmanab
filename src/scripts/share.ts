// Web Share API があれば共有の画面を開き、なければ URL をコピーする（02 の 9.1）
const COPIED_MS = 2000

for (const button of document.querySelectorAll<HTMLButtonElement>(
  '.entry-sns__target',
)) {
  const label = button.querySelector('.entry-sns__label')
  const status = button.parentElement?.querySelector('[role="status"]')
  const url = button.dataset.shareUrl ?? location.href
  const title = button.dataset.shareTitle ?? document.title
  const canShare = typeof navigator.share === 'function'
  const idle = canShare ? 'share this page' : 'copy link'
  let timer: number | undefined

  if (label) label.textContent = idle

  button.addEventListener('click', async () => {
    if (canShare) {
      try {
        await navigator.share({ title, url })
      } catch (error) {
        // 利用者が共有の画面を閉じたときは何もしない
        if ((error as DOMException).name !== 'AbortError') throw error
      }
      return
    }
    await navigator.clipboard.writeText(url)
    button.classList.add('is-copied')
    if (label) label.textContent = 'copied'
    if (status) status.textContent = 'リンクをコピーしました'
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      button.classList.remove('is-copied')
      if (label) label.textContent = idle
      if (status) status.textContent = ''
    }, COPIED_MS)
  })
}

export {}
