// Remove viewer-dependent responses left by the previous service worker.
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.delete('pa-supabase-reads'))
})
