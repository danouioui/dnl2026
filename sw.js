const CACHE_NAME = 'daily-outfit-v1';
const APP_SHELL = ['/', '/index.html', '/styles.css', '/main.js', '/manifest.json', '/assets/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).catch(() => caches.match('/index.html'));
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/index.html'));
});

self.addEventListener('push', (event) => {
  const payload = event.data?.json?.() || {};
  const title = payload.title || '오늘의 출퇴근 코디';
  const options = {
    body: payload.body || '아침 코디 브리핑을 확인해보세요.',
    icon: payload.icon || '/assets/favicon.svg',
    badge: payload.badge || '/assets/favicon.svg'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
