"use client";

import Link from "next/link";
import { etatConcept, recommander, type EtatConcept } from "@/lib/apprentissage/maitrise";
import { useProgression } from "@/lib/progression/store";
import type { Concept } from "@/content/schema";
import { libellesEtat } from "../chapitre/Validation";
import { ProgressionListe } from "../progression/Indicateurs";
import { IconeEtoile, IconeNote } from "../ui/Icones";

const libelleRegle: Record<string, string> = {
  R1: "À revoir",
  R2: "Base à consolider",
  R5: "Quiz difficile",
  R6: "Reprise",
  suite: "Suite du parcours",
};

function duree(secondes: number) {
  const minutes = Math.round(secondes / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

/** Tableau de bord : tout est calculé à partir de la progression enregistrée dans ce navigateur. */
export function TableauDeBord({
  parcours,
  titres,
  concepts,
}: {
  parcours: string[];
  titres: Record<string, string>;
  concepts: Concept[];
}) {
  const p = useProgression();
  const debut = Object.keys(p.chapitres).length === 0;
  const titresMap = new Map(Object.entries(titres));
  const recos = recommander(p, concepts, parcours, titresMap);
  const chapitres = Object.values(p.chapitres);
  const termines = chapitres.filter((c) => c.statut === "termine").length;
  const tentatives = chapitres.reduce((a, c) => a + c.tentatives, 0);
  const temps = chapitres.reduce((a, c) => a + c.tempsS, 0);
  const scores = chapitres.map((c) => c.meilleurScore).filter((s): s is number => s !== undefined);
  const moyenne = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  const parEtat = new Map<EtatConcept, Concept[]>();
  for (const c of concepts) {
    const e = etatConcept(p.concepts[c.id]?.scores ?? []);
    parEtat.set(e, [...(parEtat.get(e) ?? []), c]);
  }

  if (debut) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6">
        <p className="text-lg font-semibold text-ink">Ton tableau de bord se remplira au fil de tes chapitres.</p>
        <p className="mt-2 text-ink-2">Progression, résultats aux quiz, concepts acquis ou à revoir, recommandations : tout reste dans ce navigateur.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/commencer/" className="rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-medium text-white hover:brightness-110">
            Commencer
          </Link>
          <Link href="/parametres/#donnees" className="rounded-lg border border-line-strong px-4 py-2.5 text-sm font-medium text-ink hover:border-ink-3">
            Importer une progression
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="titre-recos">
        <h2 id="titre-recos" className="mb-3 text-lg font-semibold text-ink">
          Recommandé pour toi
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {recos.map((r) => (
            <li key={`${r.regle}-${r.chapitre}`}>
              <Link href={`/chapitre/${r.chapitre}/`} className="block h-full rounded-xl border border-line bg-surface p-4 transition-colors hover:border-brand/60">
                <span className={`text-xs font-semibold ${r.regle === "suite" ? "text-brand" : "text-warn"}`}>{libelleRegle[r.regle]}</span>
                <span className="mt-1 block font-medium text-ink">{titres[r.chapitre] ?? r.chapitre}</span>
                <span className="mt-1 block text-sm text-ink-2">{r.raison}</span>
              </Link>
            </li>
          ))}
          {recos.length === 0 ? <li className="text-sm text-ink-2">Parcours terminé, aucun concept à revoir. Bravo !</li> : null}
        </ul>
      </section>

      <section aria-labelledby="titre-chiffres" className="grid gap-3 sm:grid-cols-4">
        <h2 id="titre-chiffres" className="sr-only">
          Tes chiffres
        </h2>
        {[
          ["Chapitres terminés", `${termines}`],
          ["Quiz tentés", `${tentatives}`],
          ["Meilleurs scores, en moyenne", moyenne === null ? "—" : `${Math.round(moyenne * 100)} %`],
          ["Temps d'apprentissage", duree(temps)],
        ].map(([cle, valeur]) => (
          <div key={cle} className="rounded-xl border border-line bg-surface p-4">
            <p className="text-sm text-ink-3">{cle}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-ink tabular">{valeur}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="titre-parcours-tdb" className="rounded-xl border border-line bg-surface p-5">
        <h2 id="titre-parcours-tdb" className="mb-3 text-lg font-semibold text-ink">
          Parcours « Premiers pas »
        </h2>
        <ProgressionListe slugs={parcours} libelle="Chapitres terminés" />
        <ol className="mt-4 grid gap-1.5 sm:grid-cols-2">
          {parcours.map((s, i) => {
            const c = p.chapitres[s];
            return (
              <li key={s}>
                <Link href={`/chapitre/${s}/`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-overlay">
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${c?.statut === "termine" ? "bg-ok" : c ? "bg-info" : "bg-line-strong"}`}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-ink-2">{titres[s]}</span>
                  <span className="sr-only">{c?.statut === "termine" ? "terminé" : c ? "en cours" : "pas commencé"}</span>
                  {c?.meilleurScore !== undefined ? <span className="ml-auto font-mono text-xs text-ink-3">{Math.round(c.meilleurScore * 100)} %</span> : null}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="titre-concepts">
        <h2 id="titre-concepts" className="text-lg font-semibold text-ink">
          Tes concepts
        </h2>
        <p className="mb-3 mt-1 text-sm text-ink-3">
          Acquis : au moins 80 % sur deux questions ou plus, les plus récentes comptant davantage. À revoir : sous 60 %.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["fragile", "en-cours", "acquis", "non-vu"] as EtatConcept[]).map((e) => (
            <div key={e} className="rounded-xl border border-line bg-surface p-4">
              <p className={`mb-2 text-sm font-semibold ${libellesEtat[e].classes.split(" ").find((c) => c.startsWith("text-"))}`}>
                {libellesEtat[e].libelle} ({parEtat.get(e)?.length ?? 0})
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {(parEtat.get(e) ?? []).map((c) => (
                  <li key={c.id}>
                    <Link href={`/chapitre/${c.chapitre}/`} className={`inline-block rounded-full border px-2.5 py-1 text-xs hover:bg-overlay ${libellesEtat[e].classes}`}>
                      {c.nom}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {p.favoris.length > 0 || Object.keys(p.notes).length > 0 ? (
        <section aria-labelledby="titre-favoris" className="grid gap-3 sm:grid-cols-2">
          <h2 id="titre-favoris" className="sr-only">
            Favoris et notes
          </h2>
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <IconeEtoile className="size-4 text-gold" /> Favoris
            </p>
            <ul className="space-y-1 text-sm">
              {p.favoris.map((s) => (
                <li key={s}>
                  <Link href={`/chapitre/${s}/`} className="text-ink-2 hover:text-ink">
                    {titres[s] ?? s}
                  </Link>
                </li>
              ))}
              {p.favoris.length === 0 ? <li className="text-ink-3">Aucun favori.</li> : null}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <IconeNote className="size-4 text-brand" /> Notes
            </p>
            <ul className="space-y-2 text-sm">
              {Object.entries(p.notes).map(([s, n]) => (
                <li key={s}>
                  <Link href={`/chapitre/${s}/`} className="font-medium text-ink-2 hover:text-ink">
                    {titres[s] ?? s}
                  </Link>
                  <p className="line-clamp-2 text-ink-3">{n}</p>
                </li>
              ))}
              {Object.keys(p.notes).length === 0 ? <li className="text-ink-3">Aucune note.</li> : null}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
