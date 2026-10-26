"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ajouterTemps, allerEtape, etatActuel, ouvrirChapitre, useProgression } from "@/lib/progression/store";
import { IconeCoche, IconePrecedent, IconeSuivant } from "../ui/Icones";

export type Etape = { id: string; libelle: string; contenu: React.ReactNode };

const mouvementReduit = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.leger === "oui";

/**
 * Lecteur de chapitre en étapes (les leçons). Tout le contenu est rendu côté serveur ; le lecteur affiche
 * l'étape courante avec un glissement dans le sens de lecture, mémorise la position et compte le temps passé
 * (page visible uniquement). Un lien vers « #etape-<id> » ouvre l'étape correspondante.
 */
export function LecteurChapitre({ slug, etapes }: { slug: string; etapes: Etape[] }) {
  const [courante, setCourante] = useState(0);
  // Sens du dernier changement : 1 en avançant, -1 en reculant, 0 à l'ouverture (pas d'animation).
  const [sens, setSens] = useState(0);
  const progression = useProgression();
  const haut = useRef<HTMLDivElement>(null);
  const puces = useRef<(HTMLButtonElement | null)[]>([]);
  const restaure = useRef(false);
  const actuelle = useRef(0);

  const aller = useCallback(
    (i: number, defiler = true) => {
      const borne = Math.max(0, Math.min(etapes.length - 1, i));
      setSens(defiler ? Math.sign(borne - actuelle.current) : 0);
      actuelle.current = borne;
      setCourante(borne);
      allerEtape(slug, borne);
      const ancre = `#etape-${etapes[borne].id}`;
      if (window.location.hash !== ancre) history.replaceState(null, "", ancre);
      puces.current[borne]?.scrollIntoView({ block: "nearest", inline: "center", behavior: mouvementReduit() ? "auto" : "smooth" });
      if (defiler) {
        haut.current?.scrollIntoView({ block: "start", behavior: mouvementReduit() ? "auto" : "smooth" });
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
  const avance = termine ? 1 : (courante + 1) / etapes.length;

  return (
    <div>
      <div ref={haut} tabIndex={-1} className="scroll-mt-16 outline-none" />
      <nav
        aria-label="Étapes du chapitre"
        className="sticky top-14 z-20 -mx-4 mb-8 border-b border-line bg-bg/85 px-4 pb-3 pt-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-3"
      >
        <div className="mb-2.5 flex items-center justify-between gap-3 px-1 text-xs">
          <span className="font-medium text-ink">
            Étape {courante + 1} sur {etapes.length} · <span className="text-cyan">{etapes[courante].libelle}</span>
          </span>
          <span className="font-mono text-ink-3 tabular">{Math.round(avance * 100)} %</span>
        </div>
        <div className="mb-3 flex gap-1 px-1" aria-hidden="true">
          {etapes.map((e, i) => (
            <span key={e.id} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-soft)]"
                style={{ width: i <= courante || termine ? "100%" : "0%", background: "var(--meridien)" }}
              />
            </span>
          ))}
        </div>
        <ol className="rangee flex gap-1.5 overflow-x-auto pb-0.5">
          {etapes.map((e, i) => {
            const vue = i < courante || termine;
            return (
              <li key={e.id} className="shrink-0">
                <button
                  ref={(el) => {
                    puces.current[i] = el;
                  }}
                  type="button"
                  onClick={() => aller(i)}
                  aria-current={i === courante ? "step" : undefined}
                  className={`flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-95 ${
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
        <section
          key={e.id}
          id={`etape-${e.id}`}
          hidden={i !== courante}
          aria-label={e.libelle}
          className={i === courante && sens !== 0 ? (sens > 0 ? "etape-avant" : "etape-arriere") : undefined}
        >
          {e.contenu}
        </section>
      ))}

      <div className="mt-12 flex items-center justify-between gap-3 border-t border-line pt-5">
        <button type="button" onClick={() => aller(courante - 1)} disabled={courante === 0} className="btn btn-secondaire disabled:invisible">
          <IconePrecedent className="size-4" />
          Précédent
        </button>
        <span className="hidden text-xs text-ink-3 sm:inline">
          Étape {courante + 1} sur {etapes.length}
        </span>
        <button type="button" onClick={() => aller(courante + 1)} disabled={courante === etapes.length - 1} className="btn btn-primaire disabled:invisible">
          Continuer
          <IconeSuivant className="size-4" />
        </button>
      </div>
    </div>
  );
}
