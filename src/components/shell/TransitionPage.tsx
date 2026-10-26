"use client";

import { useState } from "react";

// Compteur partagé par toutes les pages : il survit aux navigations côté client, pas au rechargement.
let montages = 0;

/**
 * Le contenu d'une nouvelle page se pose en douceur. Le tout premier affichage n'est pas animé, pour ne pas
 * retarder le premier rendu utile (LCP).
 */
export function TransitionPage({ children }: { children: React.ReactNode }) {
  // Côté serveur, jamais d'animation : le HTML statique et la première hydratation restent identiques.
  const [anime] = useState(() => typeof window !== "undefined" && montages++ > 0);
  return <div className={anime ? "page-entree" : undefined}>{children}</div>;
}
