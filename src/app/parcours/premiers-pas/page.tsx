import type { Metadata } from "next";
import { CheminParcours } from "@/components/catalogue/Parcours";
import { BoutonHorsLigne, ProgressionListe } from "@/components/progression/Indicateurs";
import { etapesParChapitre, fiche, parcours } from "@/content";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Parcours « Premiers pas »",
  description: "Quatorze chapitres pour partir de zéro : marchés, prix, graphiques, ordres, coûts, pips, levier, risque et espérance.",
};

export default function PageParcours() {
  const fiches = parcours.map((s) => fiche(s)!);
  const duree = fiches.reduce((a, f) => a + (f.dureeMin ?? 0), 0);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="relative">
        <div className="grille-ciel pointer-events-none absolute inset-x-0 -top-8 h-56 opacity-70" aria-hidden="true" />
        <p className="relative text-sm font-medium text-cyan">Parcours recommandé</p>
        <h1 className="relative mt-1 text-3xl font-semibold text-ink sm:text-4xl">
          Premiers <span className="accent">pas</span>
        </h1>
        <p className="relative mt-3 max-w-2xl text-ink-2">
          {typographie(
            `${fiches.length} chapitres, environ ${Math.round(duree / 60)} heures en tout. Chacun suit la même progression : introduction, capsule narrée, cours, illustrations, exemple, erreurs fréquentes, résumé, quiz et validation.`,
          )}
        </p>
        <div className="relative mt-6 max-w-md">
          <ProgressionListe slugs={parcours} libelle="Chapitres terminés" />
        </div>
      </header>
      <div className="mt-10">
        <CheminParcours fiches={fiches} etapes={etapesParChapitre} />
      </div>
      <div className="carte mt-10 p-5">
        <p className="mb-3 text-[0.95rem] text-ink-2">
          {typographie("Connexion irrégulière ? Télécharge le parcours une fois : les chapitres resteront lisibles sans réseau sur cet appareil.")}
        </p>
        <BoutonHorsLigne chemins={parcours.map((s) => `/chapitre/${s}/`)} />
      </div>
    </div>
  );
}
