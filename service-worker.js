const CACHE_NAME = "peptide-reference-v85";
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
  "./research/5-Amino-1MQ_Compound_Research.md",
  "./research/CJC-1295_DAC_Compound_Research.md",
  "./protocols/Systemic_Inflammation.md",
  "./protocols/Diabetic_Neuropathy.md",
  "./protocols/Insulin_Resistance.md",
  "./protocols/Menopause.md",
  "./protocols/IBS_Gut.md",
  "./protocols/Retatrutide_Plateau.md",
  "./protocols/Hepatic_Inflammation.md",
  "./protocols/Cognitive_Decline.md",
  "./protocols/Migraine.md",
  "./protocols/Insomnia.md",
  "./protocols/Chronic_Stress_Cortisol.md",
  "./protocols/Seasonal_Allergies.md",
  "./protocols/Hypertension.md",
  "./protocols/Tesamorelin_Recomp.md",
  "./protocols/Hypothyroid.md",
  "./protocols/Immunosenescence.md",
  "./protocols/Testosterone_Decline.md",
  "./protocols/Shingles_VZV.md",
  "./protocols/Atrial_Fibrillation.md",
  "./protocols/Systemic_Multi_Organ.md",
  "./protocols/Soft_Tissue_Repair.md",
  "./protocols/Post_Viral.md",
  "./protocols/Anxiety_Mood.md",
  "./protocols/PCOS.md",
  "./protocols/Sarcopenia.md",
  "./protocols/Small_Fiber_Neuropathy.md"
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
