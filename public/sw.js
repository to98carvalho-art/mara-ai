const CACHE = 'mara-v4'
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/favicon.svg',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Only handle GET requests for same-origin or CDN assets
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)

  // Don't cache API calls
  if (url.pathname.startsWith('/api/')) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request)
        .then(res => {
          // Cache successful responses for static assets
          if (res.ok && (url.origin === self.location.origin || url.hostname.includes('fonts.googleapis'))) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(e.request, clone))
          }
          return res
        })
        .catch(() => cached) // offline fallback

      // Serve cache-first for shell, network-first for everything else
      return cached || networkFetch
    })
  )
})
