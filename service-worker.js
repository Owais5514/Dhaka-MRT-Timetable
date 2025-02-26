const CACHE_NAME = 'mrt6-cache-v1';
const urlsToCache = [
  './index.html',
  './styles.css',
  './script.js',
  './manifest.webmanifest',
  './icons/metro-icon.png',
  './mrt-6.json',
  './mrt-6-sat.json',
  './mrt-6-fri.json'
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
