// Service Worker for Gandhara Arts
// Provides offline caching and faster repeat visits

const CACHE_VERSION = 'gandhara-v2';
const RUNTIME_CACHE = 'gandhara-runtime-v2';

// Assets to cache immediately on install
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/GandharaImages/Gandharalogo.webp',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_VERSION && cacheName !== RUNTIME_CACHE)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls (let them go to network for fresh data)
  if (url.pathname.startsWith('/api/')) return;

  // Cache strategy: Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Don't cache if not a success
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone response before caching
        const responseToCache = response.clone();

        // Cache images, CSS, JS, fonts
        if (
          url.pathname.match(/\.(avif|webp|jpg|jpeg|png|gif|css|js|woff2?|ttf|otf|mp4)$/)
        ) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline page if available
          if (request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});
