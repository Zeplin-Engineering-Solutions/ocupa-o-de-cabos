/* Service worker — Zeplin Ocupação de Cabos (PWA).
   Estratégia:
   - documento (o app): network-first, cai para o cache quando offline.
     Assim um deploy novo é pego automaticamente quando há internet, e em
     obra sem sinal o app abre da cópia guardada.
   - ícones e demais assets: cache-first.
   Ao publicar uma versão nova, altere CACHE para forçar a limpeza da antiga. */
var CACHE = "zeplin-ocupacao-v1.1.0";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;

  var ehDocumento = req.mode === "navigate" || req.destination === "document";

  if(ehDocumento){
    e.respondWith(
      fetch(req).then(function(resp){
        var copia = resp.clone();
        caches.open(CACHE).then(function(c){ c.put("./index.html", copia); });
        return resp;
      }).catch(function(){
        return caches.match("./index.html").then(function(h){ return h || caches.match("./"); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function(hit){
      return hit || fetch(req).then(function(resp){
        var copia = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copia); });
        return resp;
      }).catch(function(){ return hit; });
    })
  );
});
