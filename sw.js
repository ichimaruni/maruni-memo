"use strict";

// Cache the public editor and its bundled artwork only. Drafts and local files
// stay in the existing browser storage and never reach this worker.
const scope = self.registration.scope;
const prefix = `maruni-memo-shell:${scope}:`;
const cacheName = prefix + "v1";
const index = new URL("index.html", scope).href;
const assets = [
  "manifest.webmanifest", "favicon.ico", "favicon.svg", "apple-touch-icon.png",
  "icon-192.png", "icon-512.png", "icon-maskable-512.png",
].map((path) => new URL(path, scope).href);

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll([index, ...assets].map((url) => new Request(url, { cache: "reload" })));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(prefix) && name !== cacheName)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const isEditor = request.mode === "navigate" && (request.url === scope || request.url === index);
  if (!isEditor && !assets.includes(request.url)) return;

  event.respondWith((async () => {
    const key = isEditor ? index : request.url;
    try {
      const response = await fetch(request);
      if (response.ok && !response.redirected) {
        try {
          const cache = await caches.open(cacheName);
          await cache.put(key, response.clone());
        } catch {
          // A storage restriction must not block the online editor.
        }
      }
      if (response.status < 500) return response;
    } catch {
      // Network unavailable.
    }
    try {
      const cache = await caches.open(cacheName);
      const saved = await cache.match(key);
      if (saved) return saved;
    } catch {
      // Storage could be unavailable as well.
    }
    return new Response("オフライン用のデータがありません。オンラインでマルニメモを開いてください。", {
      status: 503, headers: { "content-type": "text/plain; charset=utf-8" },
    });
  })());
});
