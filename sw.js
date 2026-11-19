/* Service worker do Nosso Amor — abre mesmo sem internet e pega a versão nova quando há rede. */
const CACHE = "nosso-amor-v3";
const ARQUIVOS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icone-192.png", "./icone-512.png", "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Página (HTML) e manifest: REDE primeiro, para nunca servir uma versão velha.
   Imagens e fontes: cache primeiro (são sempre as mesmas). */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const ehPagina = req.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    /\.(html|webmanifest)$/.test(url.pathname);

  if (ehPagina){
    e.respondWith(
      fetch(req, { cache: "no-store" })
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
          return resp;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((r) => r || fetch(req).then((resp) => {
      const copia = resp.clone();
      caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
      return resp;
    }))
  );
});
