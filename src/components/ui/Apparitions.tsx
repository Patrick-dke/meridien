"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Un seul observateur pour toute la page : chaque élément « .revele » reçoit l'attribut data-vu quand il entre
 * à l'écran, ce qui déclenche sa transition CSS. Les éléments ajoutés plus tard (contenu calculé dans le
 * navigateur) sont pris en compte grâce à un MutationObserver.
 */
export function Apparitions() {
  const chemin = usePathname();
  useEffect(() => {
    const voir = (el: Element) => el.setAttribute("data-vu", "");
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".revele").forEach(voir);
      return;
    }
    const io = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (e.isIntersecting) {
            voir(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scanner = () => document.querySelectorAll(".revele:not([data-vu])").forEach((el) => io.observe(el));
    scanner();
    // Un seul balayage par image, et seulement quand des éléments ont été ajoutés.
    let prevu = 0;
    const mo = new MutationObserver((mutations) => {
      if (prevu || !mutations.some((m) => [...m.addedNodes].some((n) => n.nodeType === 1))) return;
      prevu = requestAnimationFrame(() => {
        prevu = 0;
        scanner();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(prevu);
    };
  }, [chemin]);
  return null;
}
