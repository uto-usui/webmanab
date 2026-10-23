// 旧サイトの Service Worker（Nuxt PWA / Workbox。.snapshot/sw.js）の代わり。
// 旧 SW と同じく skipWaiting と clientsClaim ですぐに制御を取る。
// 旧 SW はページを NetworkFirst で持っていたが、ここでは同一オリジンを CacheFirst にして、
// 解除されないかぎり古い応答が出続けるようにする（解除の確かめを厳しくするため）。
const CACHE = 'workbox-runtime-legacy'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const hit = await cache.match(request)
      if (hit) return hit
      const res = await fetch(request)
      if (res.ok) await cache.put(request, res.clone())
      return res
    })(),
  )
})
