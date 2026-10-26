import type { Metadata } from "next";
import Link from "next/link";
import { TableauDeBord } from "@/components/tableau/TableauDeBord";
import { parcours, titresChapitres } from "@/content";
import { concepts } from "@/content/concepts";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Ta progression, tes résultats par concept et les recommandations pour la suite.",
};

export default function PageTableauDeBord() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Tableau de bord</h1>
          <p className="mt-1 text-sm text-ink-3">Calculé à partir de ta progression, enregistrée uniquement dans ce navigateur.</p>
        </div>
        <Link href="/parametres/#donnees" className="text-sm text-brand hover:underline">
          Sauvegarder ou transférer ma progression
        </Link>
      </div>
      <TableauDeBord parcours={parcours} titres={Object.fromEntries(titresChapitres)} concepts={concepts} />
    </div>
  );
}
