// sw.js - Service Worker with Auto-Update
// ⚠️ ONLY CHANGE THIS VERSION WHEN DEPLOYING ⚠️
const CACHE_VERSION = "2.2.1";
const CACHE_NAME = `crevate-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

// Assets to pre-cache (offline support)
const PRECACHE_ASSETS = [
  "/offline.html",
  "/logo.png",
  "/manifest.json"
];

// ============================================
// INSTALL
// ============================================
self.addEventListener("install", (event) => {
  console.log(`[SW ${CACHE_VERSION}] Installing...`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// ============================================
// ACTIVATE - Delete ALL old caches
// ============================================
self.addEventListener("activate", (event) => {
  console.log(`[SW ${CACHE_VERSION}] Activating...`);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim()) // Take control immediately
      .then(() => {
        // Notify all tabs about the update
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ 
              type: "CACHE_UPDATED", 
              version: CACHE_VERSION 
            });
          });
        });
      })
  );
});

// ============================================
// MESSAGE HANDLER
// ============================================
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ============================================
// FETCH - Network First for Everything Important
// ============================================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET and external requests
  if (request.method !== "GET") return;
  if (url.origin !== location.origin) return;
  
  // -----------------------------------------
  // HTML Pages: ALWAYS Network First
  // -----------------------------------------
  if (request.mode === "navigate" || 
      request.destination === "document" ||
      url.pathname.endsWith(".html") ||
      url.pathname === "/" ||
      !url.pathname.includes(".")) {
    
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          // Cache for offline
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL));
        })
    );
    return;
  }
  
  // -----------------------------------------
  // JS & CSS: Network First (Always Fresh)
  // -----------------------------------------
  if (url.pathname.endsWith(".js") || url.pathname.endsWith(".css")) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // -----------------------------------------
  // Images & Fonts: Cache First (Performance)
  // -----------------------------------------
  if (request.destination === "image" || 
      request.destination === "font" ||
      /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i.test(url.pathname)) {
    
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }
  
  // -----------------------------------------
  // Everything Else: Network First
  // -----------------------------------------
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});