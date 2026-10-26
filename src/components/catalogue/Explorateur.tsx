"use client";

import { useEffect, useMemo, useState } from "react";
import type { FicheChapitre } from "@/content";
import { libellesMarches, libellesStrategies, type Marche, type Strategie } from "@/content/identite";
import { useProgression } from "@/lib/progression/store";
import { CarteChapitre } from "./Cartes";

type Duree = "court" | "moyen" | "long";
type Avancement = "nouveau" | "en-cours" | "termine";
type Filtres = { niveaux: number[]; marche: Marche | null; strategies: Strategie[]; duree: Duree | null; avancement: Avancement | null; tout: boolean };

const VIDE: Filtres = { niveaux: [], marche: null, strategies: [], duree: null, avancement: null, tout: false };
const durees: Record<Duree, [string, (m: number) => boolean]> = {
  court: ["10 min ou moins", (m) => m <= 10],
  moyen: ["11 à 15 min", (m) => m > 10 && m <= 15],
  long: ["Plus de 15 min", (m) => m > 15],
};
const avancements: Record<Avancement, string> = { nouveau: "Pas commencés", "en-cours": "En cours", termine: "Terminés" };

function lireAdresse(): Filtres {
  const q = new URLSearchParams(window.location.search);
  const liste = (k: string) => (q.get(k) ?? "").split(",").filter(Boolean);
  return {
    niveaux: liste("niveau").map(Number).filter((n) => n >= 1 && n <= 5),
    marche: (liste("marche")[0] as Marche) in libellesMarches ? (liste("marche")[0] as Marche) : null,
    strategies: liste("strategie").filter((s): s is Strategie => s in libellesStrategies),
    duree: (q.get("duree") as Duree) in durees ? (q.get("duree") as Duree) : null,
    avancement: (q.get("avancement") as Avancement) in avancements ? (q.get("avancement") as Avancement) : null,
    tout: q.get("tout") === "1",
  };
}

function ecrireAdresse(f: Filtres) {
  const q = new URLSearchParams();
  if (f.niveaux.length) q.set("niveau", f.niveaux.join(","));
  if (f.marche) q.set("marche", f.marche);
  if (f.strategies.length) q.set("strategie", f.strategies.join(","));
  if (f.duree) q.set("duree", f.duree);
  if (f.avancement) q.set("avancement", f.avancement);
  if (f.tout) q.set("tout", "1");
  const s = q.toString();
  history.replaceState(null, "", `${window.location.pathname}${s ? `?${s}` : ""}${window.location.hash}`);
}

function Pastille({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className={`min-h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-95 ${
        actif ? "border-brand bg-brand-soft text-ink" : "border-line-strong text-ink-2 hover:border-ink-3 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Groupe({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={titre} className="min-w-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">{titre}</p>
      <div className="rangee -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">{children}</div>
    </div>
  );
}

/**
 * Explorateur du catalogue : filtres par niveau, marché, stratégie, durée et avancement, conservés dans
 * l'adresse (on peut partager une sélection). Les chapitres fondamentaux valent pour tous les marchés.
 */
export function Explorateur({ fiches, etapes }: { fiches: FicheChapitre[]; etapes: Record<string, number> }) {
  const [f, setF] = useState<Filtres>(VIDE);
  const [ouvert, setOuvert] = useState(false);
  const p = useProgression();

  useEffect(() => {
    // L'adresse est une source externe : elle est lue après le premier affichage.
    const id = requestAnimationFrame(() => setF(lireAdresse()));
    return () => cancelAnimationFrame(id);
  }, []);

  const changer = (maj: Partial<Filtres>) => {
    const suivant = { ...f, ...maj };
    setF(suivant);
    ecrireAdresse(suivant);
  };
  const basculer = <T,>(liste: T[], v: T) => (liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v]);

  const resultats = useMemo(
    () =>
      fiches.filter((c) => {
        if (!f.tout && !c.publie) return false;
        if (f.niveaux.length && !f.niveaux.includes(c.niveau)) return false;
        if (f.marche && c.marches.length && !c.marches.includes(f.marche)) return false;
        if (f.strategies.length && !f.strategies.includes(c.strategie)) return false;
        if (f.duree && (c.dureeMin === null || !durees[f.duree][1](c.dureeMin))) return false;
        if (f.avancement) {
          const e = p.chapitres[c.slug];
          const etat: Avancement = !e ? "nouveau" : e.statut === "termine" ? "termine" : "en-cours";
          if (etat !== f.avancement) return false;
        }
        return true;
      }),
    [fiches, f, p.chapitres],
  );

  const actifs = f.niveaux.length + (f.marche ? 1 : 0) + f.strategies.length + (f.duree ? 1 : 0) + (f.avancement ? 1 : 0);
  const strategiesPresentes = [...new Set(fiches.map((c) => c.strategie))];

  return (
    <section aria-labelledby="titre-explorer">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="titre-explorer" className="text-2xl font-semibold text-ink">
            Explorer les chapitres
          </h2>
          <p className="mt-1 text-sm text-ink-2">Filtre par niveau, marché, stratégie, durée ou avancement.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOuvert((o) => !o)} aria-expanded={ouvert} aria-controls="filtres" className="btn btn-secondaire lg:hidden">
            Filtres{actifs ? ` (${actifs})` : ""}
          </button>
          {actifs ? (
            <button type="button" onClick={() => changer({ ...VIDE, tout: f.tout })} className="btn btn-discret">
              Réinitialiser
            </button>
          ) : null}
        </div>
      </div>

      <div id="filtres" className={`carte mt-4 gap-5 p-4 sm:p-5 ${ouvert ? "grid" : "hidden"} lg:grid lg:grid-cols-[auto_1fr]`}>
        <Groupe titre="Niveau">
          {[1, 2, 3, 4, 5].map((n) => (
            <Pastille key={n} actif={f.niveaux.includes(n)} onClick={() => changer({ niveaux: basculer(f.niveaux, n) })}>
              {n}
            </Pastille>
          ))}
        </Groupe>
        <Groupe titre="Marché">
          {(Object.keys(libellesMarches) as Marche[]).map((m) => (
            <Pastille key={m} actif={f.marche === m} onClick={() => changer({ marche: f.marche === m ? null : m })}>
              {libellesMarches[m]}
            </Pastille>
          ))}
        </Groupe>
        <div className="lg:col-span-2">
          <Groupe titre="Stratégie">
            {strategiesPresentes.map((s) => (
              <Pastille key={s} actif={f.strategies.includes(s)} onClick={() => changer({ strategies: basculer(f.strategies, s) })}>
                {libellesStrategies[s]}
              </Pastille>
            ))}
          </Groupe>
        </div>
        <Groupe titre="Durée">
          {(Object.keys(durees) as Duree[]).map((d) => (
            <Pastille key={d} actif={f.duree === d} onClick={() => changer({ duree: f.duree === d ? null : d })}>
              {durees[d][0]}
            </Pastille>
          ))}
        </Groupe>
        <Groupe titre="Avancement">
          {(Object.keys(avancements) as Avancement[]).map((a) => (
            <Pastille key={a} actif={f.avancement === a} onClick={() => changer({ avancement: f.avancement === a ? null : a })}>
              {avancements[a]}
            </Pastille>
          ))}
        </Groupe>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-2" aria-live="polite">
          {resultats.length} chapitre{resultats.length > 1 ? "s" : ""}
          {f.marche ? " · les fondamentaux valent pour tous les marchés" : ""}
        </p>
        <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={f.tout} onChange={(e) => changer({ tout: e.target.checked })} className="size-4 accent-[var(--brand-solid)]" />
          Inclure les chapitres à venir
        </label>
      </div>

      {resultats.length ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resultats.map((c, i) => (
            <li key={c.slug} className="revele" style={{ ["--i" as string]: i % 6 }}>
              <CarteChapitre f={c} etapes={etapes[c.slug]} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="carte mt-4 p-8 text-center">
          <p className="font-medium text-ink">Aucun chapitre ne correspond à ces filtres.</p>
          <p className="mt-1 text-sm text-ink-2">
            {f.tout ? "Élargis ta sélection." : "Élargis ta sélection, ou inclus les chapitres à venir."}
          </p>
          <button type="button" onClick={() => changer({ ...VIDE })} className="btn btn-secondaire mt-4">
            Tout afficher
          </button>
        </div>
      )}
    </section>
  );
}
