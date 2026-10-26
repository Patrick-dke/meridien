"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Monte un contenu interactif lourd seulement quand on s'en approche (250 px avant qu'il n'entre à l'écran),
 * ou tout de suite si l'adresse porte des filtres : le premier affichage de la page n'en paie pas le coût.
 */
export function MonterAuBesoin({ children, hauteur, libelle }: { children: React.ReactNode; hauteur: number; libelle: string }) {
  const cadre = useRef<HTMLDivElement>(null);
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    const el = cadre.current;
    if (!el) return;
    if (window.location.search) {
      const id = requestAnimationFrame(() => setMonte(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMonte(true);
          io.disconnect();
        }
      },
      { rootMargin: "250px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={cadre}>
      {monte ? (
        children
      ) : (
        <div style={{ minHeight: hauteur }} aria-busy="true" className="carte squelette opacity-40">
          <p className="sr-only">{libelle}</p>
        </div>
      )}
    </div>
  );
}
