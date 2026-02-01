// sw.js - Service Worker v2.2.0
const CACHE_VERSION = "v2.2.0";
const CACHE_NAME = `crevate-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

// Static assets to pre-cache
const STATIC_ASSETS = [
  "/offline.html",
  "/css/style.css",
  "/css/components.css",
  "/css/responsive.css",
  "/js/main.js",
  "/js/components.js",
  "/logo.png",
  "/manifest.json"
];

// ============================================
// INSTALL - Cache static assets
// ============================================
self.addEventListener("install", (event) => {
  console.log(`[SW] Installing ${CACHE_NAME}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Pre-caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Skip waiting - activate immediately");
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVATE - Clean old caches & take control
// ============================================
self.addEventListener("activate", (event) => {
  console.log(`[SW] Activating ${CACHE_NAME}`);
  
  event.waitUntil(
    Promise.all([
      // Delete all old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log(`[SW] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      // Notify all clients about the update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "SW_UPDATED",
            version: CACHE_VERSION
          });
        });
      });
    })
  );
});

// ============================================
// MESSAGE - Handle skip waiting request
// ============================================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Received SKIP_WAITING message");
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// ============================================
// FETCH - Smart caching strategy
// ============================================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== "GET") return;
  
  // Skip external requests
  if (url.origin !== location.origin) return;
  
  // ----------------------------------------
  // HTML Pages: NETWORK FIRST (Always fresh)
  // ----------------------------------------
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request, {
        cache: "no-store" // Bypass browser HTTP cache
      })
      .then((response) => {
        // Cache the fresh HTML for offline use
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(request)
          .then((cached) => cached || caches.match(OFFLINE_URL));
      })
    );
    return;
  }
  
  // ----------------------------------------
  // JS/CSS Files: NETWORK FIRST with Cache Fallback
  // ----------------------------------------
  if (url.pathname.endsWith(".js") || url.pathname.endsWith(".css")) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // ----------------------------------------
  // Images/Fonts: CACHE FIRST (Performance)
  // ----------------------------------------
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }
  
  // ----------------------------------------
  // Everything else: NETWORK FIRST
  // ----------------------------------------
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(request))
  );
});