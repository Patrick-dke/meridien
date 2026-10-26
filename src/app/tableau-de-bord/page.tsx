import type { Metadata } from "next";
import Link from "next/link";
import { TableauDeBord } from "@/components/tableau/TableauDeBord";
import { fiches, parcours, titresChapitres } from "@/content";
import { concepts } from "@/content/concepts";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Ta progression, tes résultats par concept et les recommandations pour la suite.",
};

export default function PageTableauDeBord() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-cyan">Moi</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">
            Tableau de <span className="accent">bord</span>
          </h1>
          <p className="mt-2 text-sm text-ink-3">Calculé à partir de ta progression, enregistrée uniquement dans ce navigateur.</p>
        </div>
        <Link href="/parametres/#donnees" className="btn btn-secondaire">
          Sauvegarder ou transférer ma progression
        </Link>
      </div>
      <TableauDeBord parcours={parcours} titres={Object.fromEntries(titresChapitres)} concepts={concepts} fiches={fiches.filter((f) => f.publie)} />
    </div>
  );
}
