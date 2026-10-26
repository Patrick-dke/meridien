import type { Metadata } from "next";
import { ListeChapitres } from "@/components/catalogue/ListeChapitres";
import { BoutonHorsLigne, ProgressionListe } from "@/components/progression/Indicateurs";
import { chapitre, parcours } from "@/content";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Parcours « Premiers pas »",
  description: "Quatorze chapitres pour partir de zéro : marchés, prix, graphiques, ordres, coûts, pips, levier, risque et espérance.",
};

export default function PageParcours() {
  const chapitres = parcours.map((s) => chapitre(s)!);
  const duree = chapitres.reduce((a, c) => a + c.dureeMin, 0);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="text-sm font-medium text-brand">Parcours recommandé</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Premiers pas</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        {typographie(
          `${chapitres.length} chapitres, environ ${Math.round(duree / 60)} heures en tout. Chacun suit la même structure : introduction, capsule animée, cours, illustrations, exemple, erreurs fréquentes, résumé, quiz et validation.`,
        )}
      </p>
      <div className="mt-6 max-w-md">
        <ProgressionListe slugs={parcours} libelle="Chapitres terminés" />
      </div>
      <div className="mt-8">
        <ListeChapitres chapitres={chapitres.map((c) => ({ slug: c.slug, titre: c.titre }))} />
      </div>
      <div className="mt-8 rounded-xl border border-line bg-surface p-5">
        <p className="mb-3 text-[0.95rem] text-ink-2">
          {typographie("Connexion irrégulière ? Télécharge le parcours une fois : les chapitres resteront lisibles sans réseau sur cet appareil.")}
        </p>
        <BoutonHorsLigne chemins={parcours.map((s) => `/chapitre/${s}/`)} />
      </div>
    </div>
  );
}
