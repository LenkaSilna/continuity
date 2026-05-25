const STATIC_CACHE = 'continuity-static-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Cache _next/static permanently — filenames are content-hashed
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        if (hit) return hit;
        return fetch(e.request)
          .then(res => {
            if (!res.ok) return res;
            const clone = res.clone();
            e.waitUntil(
              caches.open(STATIC_CACHE).then(c => c.put(e.request, clone))
            );
            return res;
          })
          .catch(err => {
            console.error('[SW] fetch failed:', err);
            throw err;
          });
      })
    );
  }
  // All other requests (HTML, API, Supabase) go straight to network
});
