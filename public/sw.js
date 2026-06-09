// iHome Service Worker — Push Notifications

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Recebe notificação push do servidor
self.addEventListener('push', function (event) {
  let data = { title: 'iHome', body: '' };
  try { data = event.data.json(); } catch (_) {}

  const options = {
    body: data.body || '',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'ihome-alert',
    renotify: true,
    data: { url: data.url || '/' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'iHome', options)
  );
});

// Abre o app ao clicar na notificação
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      if (cs.length > 0) {
        cs[0].focus();
        cs[0].navigate(event.notification.data.url || '/');
      } else {
        clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});
