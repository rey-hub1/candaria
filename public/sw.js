const CACHE_NAME = 'kantin-smekda-v1';
const urlsToCache = [
  '/',
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Return fetch or fallback to offline page if network fails
        return fetch(event.request).catch(() => caches.match('/offline.html'));
      })
  );
});
