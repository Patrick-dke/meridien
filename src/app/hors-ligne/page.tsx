import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Hors ligne", robots: { index: false } };

export default function PageHorsLigne() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Pas de connexion</h1>
      <p className="mt-3 text-ink-2">
        Cette page n&apos;a pas encore été enregistrée sur ton appareil. Les chapitres déjà ouverts restent disponibles ; reviens ici une fois
        reconnecté pour le reste.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/parcours/premiers-pas/" className="rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-medium text-white">
          Mon parcours
        </Link>
        <Link href="/tableau-de-bord/" className="rounded-lg border border-line-strong px-4 py-2.5 text-sm font-medium text-ink">
          Tableau de bord
        </Link>
      </div>
    </div>
  );
}
