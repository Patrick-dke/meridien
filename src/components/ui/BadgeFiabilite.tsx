import Link from "next/link";
import type { Fiabilite } from "@/content/schema";

export const fiabilites: Record<Fiabilite, { libelle: string; aide: string; classes: string; symbole: string }> = {
  fait: {
    libelle: "Fait établi",
    aide: "Définition ou mécanisme vérifiable.",
    classes: "border-info/40 text-info",
    symbole: "●",
  },
  calcul: {
    libelle: "Calcul",
    aide: "Résultat mathématique exact.",
    classes: "border-[#38c6d9]/40 text-[#38c6d9]",
    symbole: "=",
  },
  convention: {
    libelle: "Convention d'analyse",
    aide: "Usage répandu, pas une loi du marché.",
    classes: "border-ink-3/50 text-ink-2",
    symbole: "◇",
  },
  ecole: {
    libelle: "Interprétation d'école",
    aide: "Lecture propre à une école de trading, non démontrée.",
    classes: "border-warn/40 text-warn",
    symbole: "◆",
  },
  hypothese: {
    libelle: "Hypothèse à tester",
    aide: "Règle de stratégie, à mesurer avant d'y croire.",
    classes: "border-[#f07a5a]/45 text-[#f07a5a]",
    symbole: "?",
  },
  mesure: {
    libelle: "Résultat mesuré",
    aide: "Chiffre lié à un rapport de mesure traçable.",
    classes: "border-ok/40 text-ok",
    symbole: "✓",
  },
};

/** Badge de fiabilité : couleur, symbole et texte, jamais la couleur seule. */
export function BadgeFiabilite({ fiabilite }: { fiabilite: Fiabilite }) {
  const f = fiabilites[fiabilite];
  return (
    <Link
      href="/methode/#fiabilite"
      data-badge=""
      title={f.aide}
      className={`inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium no-underline ${f.classes}`}
    >
      <span aria-hidden="true">{f.symbole}</span>
      {f.libelle}
    </Link>
  );
}
