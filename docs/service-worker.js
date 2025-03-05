const VERSION = new Date().toISOString().slice(0, 10); // e.g. "2023-10-07"
const CACHE_NAME = 'mrt6-cache-' + VERSION;
const urlsToCache = [
  '/',
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
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});
