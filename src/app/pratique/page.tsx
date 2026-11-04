import type { Metadata } from "next";
import { EspacePratique } from "@/components/pratique/EspacePratique";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Pratique",
  description:
    "Compte d'entraînement sur marché simulé (FCFA, euros, dollars), journal de trading avec statistiques, calculateurs de taille de position, de rendement/risque, de pips et d'espérance.",
};

export default function PagePratique() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="grid gap-4 pb-6 md:grid-cols-[1fr_1.3fr] md:items-end">
        <div>
          <p className="surtitre">Pratique</p>
          <h1 className="mt-2 text-4xl text-ink sm:text-5xl">S&apos;entraîner sans risquer d&apos;argent</h1>
        </div>
        <p className="text-ink-2">
          {typographie(
            "Un marché simulé pour appliquer les cours, un journal pour mesurer ta discipline, des calculateurs pour chaque décision de risque. Rien ici n'engage d'argent réel ni ne reflète un cours réel.",
          )}
        </p>
      </header>
      <EspacePratique />
    </div>
  );
}
