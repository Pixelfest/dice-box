// Offline support: the page pulls Tailwind, Three.js, cannon-es, Font Awesome and fonts from CDNs.
// Serve everything from cache first and refresh it in the background, so the dice box keeps working
// at a table without signal once it has been opened online.
// Because the cache is refreshed in the background, a new deploy shows up on the second visit.
const CACHE = 'dice-box-v1';
const PRECACHE = [
  './',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // Navigations all map to the single page.
      const key = request.mode === 'navigate' ? './' : request;
      const cached = await cache.match(key);
      const network = fetch(request)
        .then((response) => {
          // Opaque (no-cors) CDN responses have status 0 but are still usable.
          if (response.ok || response.type === 'opaque') cache.put(key, response.clone());
          return response;
        })
        .catch(() => cached);
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      return network;
    }),
  );
});
