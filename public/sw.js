// Push-only service worker — no fetch/cache handling, offline is out of scope.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Dosinia Luxury Resort', body: event.data.text(), url: '/portal' }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Dosinia Luxury Resort', {
      body: payload.body || '',
      icon: '/icons/icon-128x128.png',
      badge: '/icons/icon-128x128.png',
      data: { url: payload.url || '/portal' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/portal'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (new URL(client.url).pathname.startsWith('/portal') && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
