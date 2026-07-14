/* Firebase Cloud Messaging service worker — handles push while the app tab is
 * closed or in the background. It runs OUTSIDE the Angular bundle, so it loads
 * Firebase from the CDN and needs its own copy of the config.
 *
 * IMPORTANT: keep this config in sync with `environment.firebase` in
 * src/environments/environment.ts (same values). Only the fields below are
 * needed here; apiKey / projectId / messagingSenderId / appId are enough.
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAH66YLCE23W4YGNDEql6XkxDOXoarx364',
  authDomain: 'ajs-woman-pg.firebaseapp.com',
  projectId: 'ajs-woman-pg',
  storageBucket: 'ajs-woman-pg.firebasestorage.app',
  messagingSenderId: '794124150393',
  appId: '1:794124150393:web:22ae2e4f9af54585a496a8',
});

const messaging = firebase.messaging();

// Shown when a push arrives and the app is not in the foreground.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || '🔔 Rent Reminder';
  const body =
    (payload.notification && payload.notification.body) ||
    (payload.data && payload.data.body) ||
    'You have a new hostel notification.';
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    data: { link: (payload.data && payload.data.link) || '/' },
  });
});

// Focus/open the app when the notification is clicked.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
