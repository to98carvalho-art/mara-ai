const CACHE = 'mara-v6'
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
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() =>
        // Force reload all open tabs so they pick up the new version immediately
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
          clients.forEach(client => client.navigate(client.url))
        })
      )
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)

  // Never cache API calls
  if (url.pathname.startsWith('/api/')) return

  // Always fetch index.html from network (ensures latest app shell)
  if (url.pathname === '/' || url.pathname === '/index.html') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(e.request, clone))
          }
          return res
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request)
        .then(res => {
          if (res.ok && (url.origin === self.location.origin || url.hostname.includes('fonts.googleapis'))) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(e.request, clone))
          }
          return res
        })
        .catch(() => cached)

      return cached || networkFetch
    })
  )
})
