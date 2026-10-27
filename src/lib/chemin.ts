/** Sous-chemin du site (vide en local, « /meridien » sur GitHub Pages). */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Chemin d'un fichier statique (public/), qui ne passe pas par next/link. */
export const ressource = (chemin: string) => (/^(blob:|data:|https?:)/.test(chemin) ? chemin : `${basePath}${chemin}`);

/** Adresse publique du site, pour les métadonnées et le plan du site. */
export const urlSite = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
