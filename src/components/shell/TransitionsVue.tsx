"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type DocumentAvecTransitions = Document & {
  startViewTransition?: (maj: () => Promise<void>) => { finished: Promise<void> };
};

const profondeur = (chemin: string) => chemin.split("/").filter(Boolean).length;

/** Onglets de la navigation principale, dans leur ordre d'affichage : passer de l'un à l'autre glisse latéralement. */
const ONGLETS = ["/", "/formations", "/pratique", "/outils", "/tableau-de-bord"];
const onglet = (chemin: string) => {
  const i = ONGLETS.findIndex((o) => (o === "/" ? chemin === "/" : chemin.startsWith(o)));
  return i;
};

/**
 * Transitions de page à la manière d'une application : l'en-tête et la barre de navigation restent en place, le
 * contenu glisse dans le sens de la navigation (plus profond : vers la gauche ; retour : vers la droite ; d'un
 * onglet à l'autre : selon leur ordre). Repose sur l'API View Transitions ; sans elle, ou avec les animations
 * réduites, la navigation reste instantanée. Aucune dépendance.
 */
export function TransitionsVue() {
  const chemin = usePathname();
  const attente = useRef<(() => void) | null>(null);

  // La nouvelle page est rendue : la transition peut capturer son état et jouer.
  useEffect(() => {
    attente.current?.();
    attente.current = null;
  }, [chemin]);

  useEffect(() => {
    const doc = document as DocumentAvecTransitions;
    if (!doc.startViewTransition) return;
    const animationsReduites = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.leger === "oui";

    const clic = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const lien = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!lien || lien.target === "_blank" || lien.hasAttribute("download") || lien.dataset.sansTransition !== undefined) return;
      const url = new URL(lien.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      if (animationsReduites()) return;

      const depuis = location.pathname;
      const vers = url.pathname;
      const [o1, o2] = [onglet(depuis.replace(/^\/meridien/, "") || "/"), onglet(vers.replace(/^\/meridien/, "") || "/")];
      const racine = document.documentElement;
      racine.dataset.sens =
        o1 >= 0 && o2 >= 0 && o1 !== o2 && profondeur(vers) <= 2 && profondeur(depuis) <= 2
          ? o2 > o1
            ? "avant"
            : "arriere"
          : profondeur(vers) > profondeur(depuis)
            ? "avant"
            : profondeur(vers) < profondeur(depuis)
              ? "arriere"
              : "fondu";

      const transition = doc.startViewTransition!(
        () =>
          new Promise<void>((resolu) => {
            attente.current = resolu;
            // Réseau lent : on n'immobilise jamais l'écran plus d'un instant.
            window.setTimeout(resolu, 450);
          }),
      );
      transition.finished.finally(() => delete racine.dataset.sens);
    };

    // Phase de capture : la transition démarre avant que le lien ne lance la navigation.
    document.addEventListener("click", clic, { capture: true });
    return () => document.removeEventListener("click", clic, { capture: true });
  }, []);

  return null;
}
