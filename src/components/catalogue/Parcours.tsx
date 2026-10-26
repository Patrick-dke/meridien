"use client";

import Link from "next/link";
import type { FicheChapitre } from "@/content";
import { useProgression } from "@/lib/progression/store";
import { typographie } from "@/lib/typographie";
import { Carte } from "../ui/Carte";
import { IconeCoche, IconeHorloge, IconeSuivant } from "../ui/Icones";
import { Anneau } from "../ui/Progression";
import { Vignette } from "../ui/Vignette";

type Noeud = "termine" | "en-cours" | "a-faire" | "suivant";

function useNoeuds(slugs: string[]) {
  const p = useProgression();
  const suivant =
    (p.dernierChapitre && slugs.includes(p.dernierChapitre) && p.chapitres[p.dernierChapitre]?.statut !== "termine" ? p.dernierChapitre : undefined) ??
    slugs.find((s) => p.chapitres[s]?.statut !== "termine");
  const etats = slugs.map((s): Noeud => {
    const c = p.chapitres[s];
    if (c?.statut === "termine") return "termine";
    if (s === suivant) return c ? "en-cours" : "suivant";
    return c ? "en-cours" : "a-faire";
  });
  const termines = etats.filter((e) => e === "termine").length;
  return { etats, suivant, termines, commence: Object.keys(p.chapitres).some((s) => slugs.includes(s)) };
}

const styleNoeud: Record<Noeud, string> = {
  termine: "border-ok bg-ok text-bg",
  "en-cours": "border-cyan bg-cyan/15 text-cyan",
  suivant: "border-brand bg-brand-soft text-brand ring-4 ring-brand/15",
  "a-faire": "border-line-strong bg-surface text-ink-3",
};

/** Carte du parcours : le méridien et ses étapes, l'avancement, et l'action de reprise. */
export function CarteParcours({ fiches, titre, description }: { fiches: FicheChapitre[]; titre: string; description: string }) {
  const slugs = fiches.map((f) => f.slug);
  const { etats, suivant, termines, commence } = useNoeuds(slugs);
  const prochaine = fiches.find((f) => f.slug === suivant);
  return (
    <div className="carte overflow-hidden">
      <div className="grille-ciel pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        {/* min-w-0 : la rangée des étapes défile dans la carte au lieu d'élargir la colonne (et de couper le texte). */}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan">Parcours recommandé</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">{typographie(titre)}</h2>
          <p className="mt-2 max-w-xl text-ink-2">{typographie(description)}</p>
          <div className="rangee -mx-1 mt-6 overflow-x-auto px-1 py-1">
          <ol className="flex min-w-[28rem] items-center" aria-label="Étapes du parcours">
            {fiches.map((f, i) => (
              <li key={f.slug} className="flex flex-1 items-center last:flex-none">
                <Link
                  href={`/chapitre/${f.slug}/`}
                  title={f.titre}
                  aria-label={`Chapitre ${i + 1} : ${f.titre} (${etats[i] === "termine" ? "terminé" : etats[i] === "a-faire" ? "à faire" : "en cours"})`}
                  className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[0.65rem] font-semibold transition-transform hover:scale-110 sm:size-8 ${styleNoeud[etats[i]]}`}
                >
                  {etats[i] === "termine" ? <IconeCoche className="size-3.5" /> : i + 1}
                </Link>
                {i < fiches.length - 1 ? (
                  <span className="h-0.5 flex-1" style={{ background: etats[i] === "termine" ? "var(--meridien)" : "var(--line-strong)" }} aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
          </div>
        </div>
        <div className="flex items-center gap-5 lg:flex-col lg:items-end">
          <Anneau valeur={termines / fiches.length} taille={84} epaisseur={7} libelle="Chapitres terminés du parcours">
            <span className="text-center leading-tight">
              <span className="block font-mono text-lg font-semibold text-ink">
                {termines}/{fiches.length}
              </span>
              <span className="text-[0.65rem] text-ink-3">terminés</span>
            </span>
          </Anneau>
          {prochaine ? (
            <Link href={`/chapitre/${prochaine.slug}/`} className="btn btn-primaire btn-grand">
              {commence ? "Reprendre" : "Commencer"}
              <IconeSuivant className="size-4" />
            </Link>
          ) : (
            <Link href="/tableau-de-bord/" className="btn btn-secondaire btn-grand">
              Voir mon bilan
            </Link>
          )}
        </div>
      </div>
      {prochaine ? (
        <p className="relative border-t border-line px-5 py-3 text-sm text-ink-2 sm:px-7">
          Prochain chapitre : <span className="font-medium text-ink">{typographie(prochaine.titre)}</span>
          {prochaine.dureeMin ? ` · ${prochaine.dureeMin} min` : ""}
        </p>
      ) : null}
    </div>
  );
}

/** Le parcours en chemin vertical : le méridien relie les chapitres, chaque nœud dit où l'on en est. */
export function CheminParcours({ fiches, etapes }: { fiches: FicheChapitre[]; etapes: Record<string, number> }) {
  const slugs = fiches.map((f) => f.slug);
  const { etats } = useNoeuds(slugs);
  const p = useProgression();
  return (
    <ol className="relative space-y-4">
      <span className="absolute bottom-6 left-[1.2rem] top-6 w-0.5 bg-line-strong sm:left-[1.45rem]" aria-hidden="true" />
      {fiches.map((f, i) => {
        const e = etats[i];
        const c = p.chapitres[f.slug];
        const avance = c ? (c.statut === "termine" ? 1 : Math.min(0.95, (c.etape + 1) / (etapes[f.slug] ?? 9))) : 0;
        return (
          <li key={f.slug} className="revele relative flex gap-4" style={{ ["--i" as string]: i % 5 }}>
            <span
              className={`relative z-10 mt-5 flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm font-semibold sm:size-12 ${styleNoeud[e]}`}
              aria-hidden="true"
            >
              {e === "termine" ? <IconeCoche className="size-5" /> : i + 1}
            </span>
            <Carte href={`/chapitre/${f.slug}/`} className="group flex min-w-0 flex-1 overflow-hidden" aria-current={e === "suivant" || (e === "en-cours" && i === etats.indexOf("en-cours")) ? "step" : undefined}>
              <div className="hidden w-40 shrink-0 border-r border-line sm:block">
                <Vignette motif={f.motif} teinte={f.teinte} graine={f.slug} className="h-full" />
              </div>
              <div className="min-w-0 flex-1 p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
                  Chapitre {i + 1} · <span style={{ color: f.teinte }}>{f.moduleTitre}</span>
                </p>
                <h3 className="mt-1 font-semibold leading-snug text-ink">{typographie(f.titre)}</h3>
                {f.description ? <p className="mt-1 line-clamp-2 text-sm text-ink-2">{typographie(f.description)}</p> : null}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-3">
                  {f.dureeMin ? (
                    <span className="inline-flex items-center gap-1">
                      <IconeHorloge className="size-3.5" /> {f.dureeMin} min
                    </span>
                  ) : null}
                  <span className={e === "termine" ? "text-ok" : e === "a-faire" ? "" : "text-cyan"}>
                    {e === "termine" ? `Terminé${c?.meilleurScore !== undefined ? ` · ${Math.round(c.meilleurScore * 100)} %` : ""}` : e === "a-faire" ? "À faire" : e === "suivant" ? "À commencer maintenant" : `En cours · ${Math.round(avance * 100)} %`}
                  </span>
                </div>
              </div>
            </Carte>
          </li>
        );
      })}
    </ol>
  );
}
