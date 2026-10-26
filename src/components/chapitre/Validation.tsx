"use client";

import Link from "next/link";
import { etatConcept, type EtatConcept } from "@/lib/apprentissage/maitrise";
import { useProgression } from "@/lib/progression/store";

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
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-ink">Le chapitre se valide en réussissant le quiz (80 % de bonnes réponses).</p>
        <a href="#etape-quiz" className="mt-4 inline-block rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-medium text-white hover:brightness-110">
          Faire le quiz
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-5 ${c.statut === "termine" ? "border-ok/50 bg-ok/10" : "border-warn/50 bg-warn/10"}`}>
        <p className="text-lg font-semibold text-ink">{c.statut === "termine" ? "Chapitre validé" : "Chapitre pas encore validé"}</p>
        <p className="mt-1 text-sm text-ink-2">
          Dernier score : {Math.round((c.dernierScore ?? 0) * 100)} % · meilleur score : {Math.round((c.meilleurScore ?? 0) * 100)} % ·{" "}
          {c.tentatives} tentative{c.tentatives > 1 ? "s" : ""}
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Concepts de ce chapitre</p>
        <ul className="flex flex-wrap gap-2">
          {concepts.map((k) => {
            const e = libellesEtat[etatConcept(p.concepts[k.id]?.scores ?? [])];
            return (
              <li key={k.id} className={`rounded-full border px-3 py-1 text-sm ${e.classes}`}>
                {k.nom} · {e.libelle}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        {c.statut !== "termine" ? (
          <>
            <a href="#etape-cours" className="rounded-lg border border-line-strong px-4 py-2.5 text-sm font-medium text-ink hover:border-ink-3">
              Revoir le cours
            </a>
            <a href="#etape-quiz" className="rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-medium text-white hover:brightness-110">
              Refaire le quiz
            </a>
          </>
        ) : suivant ? (
          <Link href={`/chapitre/${suivant.slug}/`} className="rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-medium text-white hover:brightness-110">
            Chapitre suivant : {suivant.titre}
          </Link>
        ) : (
          <Link href="/tableau-de-bord/" className="rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-medium text-white hover:brightness-110">
            Parcours terminé : voir mon tableau de bord
          </Link>
        )}
        <Link href="/parcours/premiers-pas/" className="rounded-lg border border-line-strong px-4 py-2.5 text-sm font-medium text-ink-2 hover:text-ink">
          Retour au parcours
        </Link>
      </div>
    </div>
  );
}
