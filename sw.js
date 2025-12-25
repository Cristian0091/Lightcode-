/**
 * Service Worker para LightCode Editor
 * Habilita funcionamiento offline y caché inteligente
 */

const CACHE_NAME = 'lightcode-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/editor.js',
  '/preview.js',
  '/storage.js',
  '/theme.js'
];

// Instalación - cachear recursos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cacheando recursos esenciales');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación - limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de cache: Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
  // Solo manejar solicitudes GET
  if (event.request.method !== 'GET') return;
  
  // Excluir recursos de la API y websockets
  const url = new URL(event.request.url);
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;
  
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Si la respuesta es válida, actualizar cache
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // Fallback a cache
          return cache.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Fallback para página principal
              if (event.request.mode === 'navigate') {
                return cache.match('/index.html');
              }
              
              return new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        });
    })
  );
});