var CACHE_NAME = "minum-cache-v4";
var URLS_TO_CACHE = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./obat-data.json"
];

self.addEventListener("install", function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// Halaman utama (HTML): coba ambil versi terbaru dari internet dulu (network-first),
// supaya pembaruan yang Anda upload ke GitHub langsung terpakai. Kalau offline, baru pakai cache.
// File pendukung (ikon dll): cache-first seperti biasa, karena jarang berubah.
self.addEventListener("fetch", function(event){
  var isHtmlRequest = event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").indexOf("text/html") > -1;

  if(isHtmlRequest){
    event.respondWith(
      fetch(event.request).then(function(response){
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        return response;
      }).catch(function(){
        return caches.match(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request);
    })
  );
});

