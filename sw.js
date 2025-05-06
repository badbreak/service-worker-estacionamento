const CACHE_NAME = 'parking-control-v10';
const urlsToCache = [
  '/',
  '/index.html',
  '/?path=manifest.json',
  '/?path=offline',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache aberto:', CACHE_NAME);
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url)
              .then(() => console.log(`[Service Worker] Cacheado: ${url}`))
              .catch(error => {
                console.error(`[Service Worker] Erro ao cachear ${url}:`, error);
                throw error;
              });
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Todos os recursos cacheados');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Erro ao abrir cache:', error);
        throw error;
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Ativando Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Cache antigo limpo');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  console.log('[Service Worker] Fetch:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('[Service Worker] Retornando do cache:', event.request.url);
          return response;
        }
        console.log('[Service Worker] Buscando na rede:', event.request.url);
        return fetch(event.request).catch(error => {
          console.error('[Service Worker] Rede indisponível:', error);
          return caches.match('/?path=offline');
        });
      })
      .catch(error => {
        console.error('[Service Worker] Erro no fetch:', error);
        return caches.match('/?path=offline');
      })
  );
});
