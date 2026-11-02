// デモの動画は autoplay を付けずに出し、動きを減らす設定でなければここで再生する。
// autoplay を付けると、動きを減らす設定でも止められず、preload="none" でも読み込まれるため
const reduce = matchMedia('(prefers-reduced-motion: reduce)')

const videos = document.querySelectorAll<HTMLVideoElement>('.entry-demo__video')

const sync = () => {
  for (const video of videos) {
    if (reduce.matches) video.pause()
    // 再生を止められたとき（省電力モードなど）は、ポスター画像のままにする
    else video.play().catch(() => {})
  }
}

sync()
reduce.addEventListener('change', sync)
