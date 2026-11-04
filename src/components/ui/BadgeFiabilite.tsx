import Link from "next/link";
import type { Fiabilite } from "@/content/schema";

export const fiabilites: Record<Fiabilite, { libelle: string; aide: string; classes: string; symbole: string }> = {
  fait: {
    libelle: "Fait établi",
    aide: "Définition ou mécanisme vérifiable.",
    classes: "text-info",
    symbole: "●",
  },
  calcul: {
    libelle: "Calcul",
    aide: "Résultat mathématique exact.",
    classes: "text-cyan",
    symbole: "=",
  },
  convention: {
    libelle: "Convention d'analyse",
    aide: "Usage répandu, pas une loi du marché.",
    classes: "text-ink-2",
    symbole: "◇",
  },
  ecole: {
    libelle: "Interprétation d'école",
    aide: "Lecture propre à une école de trading, non démontrée.",
    classes: "text-warn",
    symbole: "◆",
  },
  hypothese: {
    libelle: "Hypothèse à tester",
    aide: "Règle de stratégie, à mesurer avant d'y croire.",
    classes: "text-bad",
    symbole: "?",
  },
  mesure: {
    libelle: "Résultat mesuré",
    aide: "Chiffre lié à un rapport de mesure traçable.",
    classes: "text-ok",
    symbole: "✓",
  },
};

/** Mention de fiabilité, en marge : filet et texte de la même couleur, symbole et libellé, jamais la couleur seule. */
export function BadgeFiabilite({ fiabilite }: { fiabilite: Fiabilite }) {
  const f = fiabilites[fiabilite];
  return (
    <Link
      href="/methode/#fiabilite"
      data-badge=""
      title={f.aide}
      className={`inline-flex min-h-6 items-center gap-1.5 border-l-2 border-current pl-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] no-underline hover:underline ${f.classes}`}
    >
      <span aria-hidden="true">{f.symbole}</span>
      {f.libelle}
    </Link>
  );
}
