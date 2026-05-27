// FakeLive Pro — Service Worker (PWA offline support)
const CACHE_NAME  = 'fakelive-pro-v19';
const CACHE_CDN   = 'fakelive-cdn-v19';

// App shell: cached on install → instant load offline
const APP_SHELL = [
  '/',
  '/index.html',
  '/app.js',
  '/auth.js',
  '/style.css',
  '/icon.svg',
  '/manifest.json'
];

// CDN resources cached on first use (network-first → cache fallback)
const CDN_PATTERNS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net'          // Supabase JS SDK
];

// ── Install: pre-cache app shell ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())  // activa inmediatamente sin esperar tabs cerrados
  );
});

// ── Activate: limpiar caches viejos y notificar tabs para recargar ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CACHE_CDN)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => {
        // Notificar a todos los tabs abiertos → se recargan con el código nuevo
        return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      })
      .then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME }));
      })
  );
});

// ── Fetch: cache strategy ─────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Skip non-GET and chrome-extension
  if (event.request.method !== 'GET') return;
  if (url.startsWith('chrome-extension://')) return;

  // Gemini API calls → always network (never cache)
  if (url.includes('generativelanguage.googleapis.com')) return;

  // Supabase → always network (auth + DB, never cache)
  if (url.includes('supabase.co')) return;

  const isCdn = CDN_PATTERNS.some(p => url.includes(p));

  if (isCdn) {
    // CDN: network first, cache as fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_CDN).then(c => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // App shell: network first → actualiza caché + sirve fresco
    // (evita que un tab abierto siga con JS viejo tras un deploy)
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))  // sin red → caché como fallback
    );
  }
});
