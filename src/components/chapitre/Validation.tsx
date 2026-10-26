"use client";

import Link from "next/link";
import { etatConcept, maitrise, type EtatConcept } from "@/lib/apprentissage/maitrise";
import { useProgression } from "@/lib/progression/store";
import { IconeEtoile } from "../ui/Icones";
import { Anneau, Jauge } from "../ui/Progression";

export const libellesEtat: Record<EtatConcept, { libelle: string; classes: string }> = {
  acquis: { libelle: "Acquis", classes: "border-ok/50 text-ok" },
  "en-cours": { libelle: "En cours", classes: "border-info/50 text-info" },
  fragile: { libelle: "À revoir", classes: "border-warn/50 text-warn" },
  "non-vu": { libelle: "Pas encore testé", classes: "border-line-strong text-ink-3" },
};

/** Dernière étape : bilan du quiz, état des concepts du chapitre et suite du parcours. */
export function Validation({
  slug,
  concepts,
  suivant,
}: {
  slug: string;
  concepts: { id: string; nom: string }[];
  suivant: { slug: string; titre: string } | null;
}) {
  const p = useProgression();
  const c = p.chapitres[slug];

  if (!c || c.tentatives === 0) {
    return (
      <div className="carte flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ink">Le chapitre se valide en réussissant le quiz (80 % de bonnes réponses).</p>
        <a href="#etape-quiz" className="btn btn-primaire shrink-0">
          Faire le quiz
        </a>
      </div>
    );
  }

  const valide = c.statut === "termine";
  return (
    <div className="space-y-7">
      <div className={`apparition carte relative flex flex-col items-center gap-5 overflow-hidden p-6 text-center sm:flex-row sm:text-left ${valide ? "!border-gold/40" : "!border-warn/40"}`}>
        {valide ? <span className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" /> : null}
        <Anneau valeur={c.meilleurScore ?? 0} taille={96} epaisseur={8} libelle="Meilleur score" teinte={valide ? "var(--gold)" : "var(--warn)"}>
          {valide ? <IconeEtoile pleine className="size-9 text-gold" /> : <span className="font-mono text-lg font-semibold text-ink">{Math.round((c.meilleurScore ?? 0) * 100)}%</span>}
        </Anneau>
        <div className="relative">
          <p className="text-xl font-semibold text-ink">{valide ? "Chapitre validé" : "Chapitre pas encore validé"}</p>
          <p className="mt-1 text-sm text-ink-2">
            Dernier score : {Math.round((c.dernierScore ?? 0) * 100)} % · meilleur score : {Math.round((c.meilleurScore ?? 0) * 100)} % ·{" "}
            {c.tentatives} tentative{c.tentatives > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink">Concepts de ce chapitre</p>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {concepts.map((k, i) => {
            const scores = p.concepts[k.id]?.scores ?? [];
            const e = libellesEtat[etatConcept(scores)];
            return (
              <li key={k.id} className="revele rounded-xl border border-line bg-surface px-4 py-3" style={{ ["--i" as string]: i }}>
                <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                  <span className="text-ink">{k.nom}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${e.classes}`}>{e.libelle}</span>
                </div>
                <Jauge valeur={maitrise(scores).valeur} libelle={`Maîtrise de ${k.nom}`} className="!h-1.5" />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        {!valide ? (
          <>
            <a href="#etape-cours" className="btn btn-secondaire">
              Revoir le cours
            </a>
            <a href="#etape-quiz" className="btn btn-primaire">
              Refaire le quiz
            </a>
          </>
        ) : suivant ? (
          <Link href={`/chapitre/${suivant.slug}/`} className="btn btn-primaire btn-grand">
            Chapitre suivant : {suivant.titre}
          </Link>
        ) : (
          <Link href="/tableau-de-bord/" className="btn btn-primaire btn-grand">
            Parcours terminé : voir mon tableau de bord
          </Link>
        )}
        <Link href="/parcours/premiers-pas/" className="btn btn-secondaire">
          Retour au parcours
        </Link>
      </div>
    </div>
  );
}
