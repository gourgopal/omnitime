/// <reference lib="webworker" />

// This custom code will be appended to the auto-generated Workbox sw.js by next-pwa.
// It handles clicking on the notifications so it opens the EV charging page.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url.includes('/calculators/ev-charging') && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/calculators/ev-charging');
      }
    })
  );
});
