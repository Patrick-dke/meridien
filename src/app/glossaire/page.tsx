import type { Metadata } from "next";
import { FiltreGlossaire } from "@/components/glossaire/FiltreGlossaire";
import { glossaire } from "@/content/glossaire";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Glossaire",
  description: "Le vocabulaire du trading expliqué simplement : spread, pip, lot, levier, stop loss, espérance et bien d'autres.",
};

export default function PageGlossaire() {
  const termes = [...glossaire]
    .sort((a, b) => a.terme.localeCompare(b.terme, "fr"))
    .map((t) => ({ slug: t.slug, terme: typographie(t.terme), court: typographie(t.court), synonymes: t.synonymes }));
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Glossaire</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        {typographie(`${glossaire.length} termes, définis simplement. Dans les cours, les mots soulignés en pointillés ouvrent leur définition sans quitter la page.`)}
      </p>
      <div className="mt-6">
        <FiltreGlossaire termes={termes} />
      </div>
    </div>
  );
}
