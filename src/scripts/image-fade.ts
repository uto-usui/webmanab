// data-lazy="loading" の画像が読み終わったら loaded（失敗したら error）にして、CSS のフェードを効かせる。
// load / error は bubble しないので capture で拾う。無限スクロールで足した画像もこれで拾える
const SELECTOR = 'img[data-lazy="loading"]'

function onEvent(event: Event) {
  const img = event.target
  if (img instanceof HTMLImageElement && img.matches(SELECTOR)) {
    img.dataset.lazy = event.type === 'load' ? 'loaded' : 'error'
  }
}

document.addEventListener('load', onEvent, true)
document.addEventListener('error', onEvent, true)

// この script より先に読み終わった画像には load が来ない。
// 読み込みに失敗した画像も complete になるので、成否は decode() で見分ける
for (const img of document.querySelectorAll<HTMLImageElement>(SELECTOR)) {
  if (!img.complete) continue
  img.decode().then(
    () => (img.dataset.lazy = 'loaded'),
    () => (img.dataset.lazy = 'error'),
  )
}

export {}
