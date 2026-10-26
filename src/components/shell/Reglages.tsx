"use client";

import { useEffect } from "react";
import { ressource } from "@/lib/chemin";
import { useProgression } from "@/lib/progression/store";

type ConnexionReseau = { saveData?: boolean; effectiveType?: string };

/** Mode léger automatique : économie de données, réseau lent ou petit appareil. */
function legerAutomatique() {
  const n = navigator as Navigator & { connection?: ConnexionReseau; deviceMemory?: number };
  return Boolean(
    n.connection?.saveData ||
      ["slow-2g", "2g"].includes(n.connection?.effectiveType ?? "") ||
      (n.deviceMemory !== undefined && n.deviceMemory <= 2),
  );
}

/** Applique les réglages enregistrés à la page entière (palette, taille du texte, mode léger). */
export function AppliquerReglages() {
  const { reglages } = useProgression();
  useEffect(() => {
    const racine = document.documentElement;
    racine.dataset.palette = reglages.palette;
    racine.dataset.text = reglages.texte;
    const leger = reglages.leger === "oui" || (reglages.leger === "auto" && legerAutomatique());
    racine.dataset.leger = leger ? "oui" : "non";
  }, [reglages]);
  return null;
}

/** Service worker : pages consultées disponibles hors ligne. Uniquement sur le site construit. */
export function EnregistrerServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const enregistrer = () => {
      navigator.serviceWorker.register(ressource("/sw.js"), { scope: ressource("/") }).catch(() => {
        // Sans service worker, le site fonctionne normalement, sans mode hors ligne.
      });
    };
    if (document.readyState === "complete") enregistrer();
    else window.addEventListener("load", enregistrer, { once: true });
  }, []);
  return null;
}
