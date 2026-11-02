// デモの動画は autoplay を付けずに出し、動きを減らす設定でなければここで再生する。
// autoplay を付けると、動きを減らす設定でも止められず、preload="none" でも読み込まれるため
const reduce = matchMedia('(prefers-reduced-motion: reduce)')

for (const preview of document.querySelectorAll<HTMLElement>(
  '.entry-demo__preview',
)) {
  const video = preview.querySelector<HTMLVideoElement>('.entry-demo__video')
  const toggle = preview.querySelector<HTMLButtonElement>('.entry-demo__toggle')
  if (!video || !toggle) continue

  // 利用者がボタンで止めたら、設定が変わっても勝手に再生し直さない
  let stoppedByUser = false
  // 再生を止められたときや動画を読めなかったとき（省電力モード、webm を再生できないブラウザなど）は、
  // ポスター画像のまま再生のボタンにする。読めなかったときは paused が false のまま残るので止め直す
  const play = () => video.play().catch(() => video.pause())

  const render = () => {
    const playing = !video.paused
    toggle.toggleAttribute('data-playing', playing)
    toggle.setAttribute('aria-label', playing ? '動画を一時停止' : '動画を再生')
  }

  video.addEventListener('play', render)
  video.addEventListener('pause', render)
  // 動画を取れなかったときは、play() が終わらないままになることがある
  video.querySelector('source')?.addEventListener('error', () => video.pause())
  toggle.addEventListener('click', () => {
    if (video.paused) {
      stoppedByUser = false
      play()
    } else {
      stoppedByUser = true
      video.pause()
    }
  })
  reduce.addEventListener('change', () => {
    if (reduce.matches) video.pause()
    else if (!stoppedByUser) play()
  })

  toggle.hidden = false
  render()
  if (!reduce.matches) play()
}
