const CACHE_NAME = "semana-cultural-v1"
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo-semana-cultural.png",
  // Añade aquí todos los recursos que quieras cachear
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devuelve la respuesta cacheada si existe
      if (response) {
        return response
      }

      // Si no está en caché, intenta obtenerla de la red
      return fetch(event.request)
        .then((response) => {
          // Verifica que la respuesta sea válida
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clona la respuesta para poder almacenarla en caché
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Si falla la red, intenta devolver una página offline
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html")
          }
        })
    }),
  )
})

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
