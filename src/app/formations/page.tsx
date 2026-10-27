import type { Metadata } from "next";
import Link from "next/link";
import { CarteModule } from "@/components/offre/Offre";
import { modulesPresentes } from "@/content/presentation";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Formations",
  description: "Le parcours de formation Méridien, module par module : Premiers pas gratuit, puis marchés, risque, analyse technique, price action, SMC, ICT et méthode.",
};

export default function PageFormations() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-cyan">Formations</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">
          Un parcours, <span className="accent">huit niveaux</span>
        </h1>
        <p className="mt-3 text-ink-2">
          {typographie(
            "« Premiers pas » est gratuit et ouvert sans compte. Les modules suivants se débloquent un par un, par paiement unique en Orange Money ou MTN MoMo : chacun s'appuie sur les précédents.",
          )}
        </p>
      </header>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {modulesPresentes.map((m) => (
          <li key={m.id}>
            <CarteModule m={m} />
          </li>
        ))}
      </ul>
      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-ink-3">
        Les formations enseignent des méthodes d&apos;analyse et de gestion du risque ; elles ne promettent aucun gain. Le trading comporte un risque élevé de
        perte en capital : lis l&apos;
        <Link href="/legal/risques/" className="text-brand underline">
          avertissement sur les risques
        </Link>
        .
      </p>
    </div>
  );
}
