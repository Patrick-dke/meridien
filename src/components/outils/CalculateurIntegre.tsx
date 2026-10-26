import Link from "next/link";
import { CalculateurEsperance, CalculateurPips, CalculateurPosition, CalculateurRendementRisque } from "./Calculateurs";

export const outils = {
  position: { titre: "Calculateur de taille de position", ancre: "position", Composant: CalculateurPosition },
  "rendement-risque": { titre: "Calculateur de rendement/risque", ancre: "rendement-risque", Composant: CalculateurRendementRisque },
  pips: { titre: "Calculateur de pips", ancre: "pips", Composant: CalculateurPips },
  esperance: { titre: "Espérance et séries de pertes", ancre: "esperance", Composant: CalculateurEsperance },
} as const;

/** Calculateur inséré dans un cours, avec un lien vers la page des outils. */
export function CalculateurIntegre({ outil }: { outil: keyof typeof outils }) {
  const { titre, ancre, Composant } = outils[outil];
  return (
    <section aria-label={titre} className="not-prose my-6 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-base font-semibold text-ink">{titre}</h4>
        <Link href={`/outils/#${ancre}`} className="text-sm text-brand hover:underline">
          Ouvrir dans les outils
        </Link>
      </div>
      <Composant />
    </section>
  );
}
