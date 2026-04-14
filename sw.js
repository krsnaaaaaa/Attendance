// AttendX Service Worker v2
const CACHE = 'attendx-v2';
const ASSETS = ['./', './index.html', './manifest.json'];

// Install: cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

// Notification click handler — deep-link into app
self.addEventListener('notificationclick', e => {
  const action = e.action || e.notification.data?.action || 'view';
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // If app already open, focus it and send action
      const existing = list.find(c => c.url.includes(self.location.origin) && 'focus' in c);
      if (existing) {
        existing.focus();
        existing.postMessage({ action });
        return;
      }
      // Otherwise open the app
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

// Notification close (user dismissed)
self.addEventListener('notificationclose', e => {
  // Could log analytics here
});
