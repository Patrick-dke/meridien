"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ajouterTemps, allerEtape, etatActuel, ouvrirChapitre, useProgression } from "@/lib/progression/store";
import { IconeCoche, IconePrecedent, IconeSuivant } from "../ui/Icones";

export type Etape = { id: string; libelle: string; contenu: React.ReactNode };

/**
 * Lecteur de chapitre en étapes. Tout le contenu est rendu côté serveur ; le lecteur se contente d'afficher
 * l'étape courante, de mémoriser la position et de compter le temps passé (page visible uniquement).
 * Un lien vers « #etape-<id> » ouvre l'étape correspondante.
 */
export function LecteurChapitre({ slug, etapes }: { slug: string; etapes: Etape[] }) {
  const [courante, setCourante] = useState(0);
  const progression = useProgression();
  const haut = useRef<HTMLDivElement>(null);
  const restaure = useRef(false);

  const aller = useCallback(
    (i: number, defiler = true) => {
      const borne = Math.max(0, Math.min(etapes.length - 1, i));
      setCourante(borne);
      allerEtape(slug, borne);
      const ancre = `#etape-${etapes[borne].id}`;
      if (window.location.hash !== ancre) history.replaceState(null, "", ancre);
      if (defiler) {
        haut.current?.scrollIntoView({ block: "start" });
        haut.current?.focus({ preventScroll: true });
      }
    },
    [etapes, slug],
  );

  // À l'ouverture : enregistre la visite, puis reprend l'étape demandée par l'adresse ou la dernière étape vue.
  useEffect(() => {
    ouvrirChapitre(slug);
  }, [slug]);

  useEffect(() => {
    if (restaure.current) return;
    // L'adresse et le stockage sont des sources externes : on les lit après le premier affichage.
    const id = requestAnimationFrame(() => {
      restaure.current = true;
      const depuisAdresse = etapes.findIndex((e) => `#etape-${e.id}` === window.location.hash);
      const memorisee = etatActuel().chapitres[slug]?.etape;
      if (depuisAdresse >= 0) aller(depuisAdresse, false);
      else if (memorisee && memorisee < etapes.length) aller(memorisee, false);
    });
    return () => cancelAnimationFrame(id);
  }, [aller, etapes, slug]);

  useEffect(() => {
    const surAncre = () => {
      const i = etapes.findIndex((e) => `#etape-${e.id}` === window.location.hash);
      if (i >= 0) aller(i);
    };
    window.addEventListener("hashchange", surAncre);
    return () => window.removeEventListener("hashchange", surAncre);
  }, [aller, etapes]);

  useEffect(() => {
    const minuterie = window.setInterval(() => {
      if (document.visibilityState === "visible") ajouterTemps(slug, 15);
    }, 15000);
    return () => window.clearInterval(minuterie);
  }, [slug]);

  const termine = progression.chapitres[slug]?.statut === "termine";

  return (
    <div>
      <div ref={haut} tabIndex={-1} className="scroll-mt-20 outline-none" />
      <nav aria-label="Étapes du chapitre" className="sticky top-14 z-20 -mx-4 mb-6 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-3">
        <ol className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {etapes.map((e, i) => {
            const vue = i < courante || termine;
            return (
              <li key={e.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => aller(i)}
                  aria-current={i === courante ? "step" : undefined}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    i === courante
                      ? "border-brand bg-brand-soft text-ink"
                      : vue
                        ? "border-line text-ink-2 hover:text-ink"
                        : "border-line text-ink-3 hover:text-ink-2"
                  }`}
                >
                  {vue && i !== courante ? <IconeCoche className="size-3.5 text-ok" /> : <span className="font-mono">{i + 1}</span>}
                  {e.libelle}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {etapes.map((e, i) => (
        <section key={e.id} id={`etape-${e.id}`} hidden={i !== courante} aria-label={e.libelle}>
          {e.contenu}
        </section>
      ))}

      <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-5">
        <button
          type="button"
          onClick={() => aller(courante - 1)}
          disabled={courante === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-4 py-2.5 text-sm font-medium text-ink-2 hover:text-ink disabled:invisible"
        >
          <IconePrecedent className="size-4" />
          Précédent
        </button>
        <span className="text-xs text-ink-3">
          Étape {courante + 1} sur {etapes.length}
        </span>
        <button
          type="button"
          onClick={() => aller(courante + 1)}
          disabled={courante === etapes.length - 1}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:invisible"
        >
          Continuer
          <IconeSuivant className="size-4" />
        </button>
      </div>
    </div>
  );
}
