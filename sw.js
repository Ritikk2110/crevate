const CACHE_NAME = "crevate-v2.1.1";
const OFFLINE_URL = "/offline.html";

const ASSETS = [
  "/offline.html",
  "/css/style.css",
  "/css/components.css",
  "/css/responsive.css",
  "/js/main.js",
  "/js/components.js",
  "/logo.png",
  "/manifest.json"
];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});
// 🔥 ADD THIS BLOCK (UPDATE HANDLER)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("⏭️ Skipping waiting and activating new SW");
    self.skipWaiting();
  }
});


// FETCH
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // ✅ HTML → NETWORK FIRST
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(event.request, copy)
          );
          return res;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // ✅ ASSETS → CACHE FIRST
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(event.request, copy)
          );
          return res;
        })
      );
    })
  );
});
