const CACHE_NAME = "peptide-reference-v48";
const ASSETS = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./jump.js",
  "./manifest.json",
  "./data/peptides.json",
  "./data/protocols.json",
  "./icons/icon.svg",
  "./research/TB-500_Compound_Research.md",
  "./research/BPC-157_Compound_Research.md",
  "./research/GHK-Cu_Compound_Research.md",
  "./research/MOTS-c_Compound_Research.md",
  "./research/Retatrutide_Compound_Research.md",
  "./research/SS-31_Compound_Research.md",
  "./research/ARA-290_Compound_Research.md",
  "./research/KPV_Compound_Research.md",
  "./research/NAD+_Compound_Research.md",
  "./protocols/Systemic_Inflammation.md",
  "./protocols/Diabetic_Neuropathy.md"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetched;
    })
  );
});
