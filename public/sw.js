/* Service worker Méridien : les pages consultées restent lisibles hors ligne. */
const VERSION = "v1";
const CACHE_PAGES = `meridien-pages-${VERSION}`;
const CACHE_STATIQUE = `meridien-statique-${VERSION}`;
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const HORS_LIGNE = `${BASE}/hors-ligne/`;

self.addEventListener("install", (evenement) => {
  evenement.waitUntil(
    caches
      .open(CACHE_PAGES)
      .then((cache) => cache.addAll([HORS_LIGNE, `${BASE}/`]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evenement) => {
  evenement.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== CACHE_PAGES && c !== CACHE_STATIQUE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

function enregistrer(nomCache, requete, reponse) {
  if (reponse.ok) {
    const copie = reponse.clone();
    caches.open(nomCache).then((cache) => cache.put(requete, copie));
  }
  return reponse;
}

self.addEventListener("fetch", (evenement) => {
  const requete = evenement.request;
  if (requete.method !== "GET") return;
  const url = new URL(requete.url);
  if (url.origin !== self.location.origin) return;

  // Pages : réseau d'abord (contenu à jour), cache en secours, puis page « hors ligne ».
  if (requete.mode === "navigate") {
    evenement.respondWith(
      fetch(requete)
        .then((reponse) => enregistrer(CACHE_PAGES, requete, reponse))
        .catch(async () => (await caches.match(requete, { ignoreSearch: true })) ?? caches.match(HORS_LIGNE)),
    );
    return;
  }

  // Fichiers versionnés de Next.js : leur adresse change à chaque version, le cache suffit.
  if (url.pathname.includes("/_next/static/")) {
    evenement.respondWith(caches.match(requete).then((trouve) => trouve ?? fetch(requete).then((r) => enregistrer(CACHE_STATIQUE, requete, r))));
    return;
  }

  // Autres ressources du site (données de navigation, icônes, index de recherche) : réseau d'abord.
  evenement.respondWith(
    fetch(requete)
      .then((reponse) => enregistrer(CACHE_PAGES, requete, reponse))
      .catch(() => caches.match(requete)),
  );
});
