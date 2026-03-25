const CACHE_NAME = 'rnr-v1'
const STATIC_ASSETS = ['/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(STATIC_ASSETS)
    )
  )
})

self.addEventListener('fetch', (event) => {
  // Network first strategy — always try network
  // Fall back to cache only for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/')
      )
    )
  }
})
