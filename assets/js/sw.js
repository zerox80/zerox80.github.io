
const CACHE = 'lpic1-cache-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(self.precacheList || [])));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(resp => {
        caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
        return resp;
      }).catch(()=>cached);
      return cached || fetchPromise;
    })
  );
});
