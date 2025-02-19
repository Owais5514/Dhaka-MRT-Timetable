const CACHE_NAME = 'mrt6-cache-v1';
const urlsToCache = [
  './docs/index.html',
  './docs/styles.css',
  './docs/script.js',
  './docs/manifest.json',
  './docs/icons/metro-icon.png',
  './docs/mrt-6.json',
  './docs/mrt-6-sat.json',
  './docs/mrt-6-fri.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if(!cacheWhitelist.includes(key)){
            return caches.delete(key);
          }
        })
      )
    )
  );
});
