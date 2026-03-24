// Minimal service worker — enables the PWA update lifecycle.
// Does not cache anything. Listens for SKIP_WAITING message
// from the client to activate immediately when an update is ready.

self.addEventListener('install', () => {
  // New SW installed — stay in waiting state until told to activate
});

self.addEventListener('activate', (event) => {
  // Claim all clients so the new SW takes control immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
