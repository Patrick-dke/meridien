import type { Metadata } from "next";
import { outils } from "@/components/outils/CalculateurIntegre";
import { typographie } from "@/lib/typographie";

export const metadata: Metadata = {
  title: "Outils",
  description: "Calculateurs gratuits : taille de position, rendement/risque avec frais, pips et valeur du pip, espérance et séries de pertes.",
};

const descriptions: Record<keyof typeof outils, string> = {
  position: "Combien acheter pour ne pas perdre plus que prévu si le stop est touché.",
  "rendement-risque": "Le ratio de ton plan et le taux de réussite minimal pour qu'il soit rentable, frais compris.",
  pips: "Mesurer un mouvement en pips et le traduire en argent selon la taille de position.",
  esperance: "Ce que rapporte une méthode en moyenne, et la probabilité de traverser une série de pertes.",
};

export default function PageOutils() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="text-sm font-medium text-cyan">Pratiquer</p>
      <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">
        Les <span className="accent">outils</span>
      </h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        {typographie(
          "Des calculateurs pour manipuler les notions des cours. Ils font des calculs exacts à partir de tes hypothèses : ils ne disent rien de ce que fera le marché.",
        )}
      </p>
      <nav aria-label="Calculateurs" className="mt-6 flex flex-wrap gap-2">
        {Object.entries(outils).map(([cle, o]) => (
          <a key={cle} href={`#${o.ancre}`} className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-brand/60 hover:text-ink">
            {o.titre.replace("Calculateur de ", "")}
          </a>
        ))}
      </nav>
      <div className="mt-8 space-y-10">
        {(Object.entries(outils) as [keyof typeof outils, (typeof outils)[keyof typeof outils]][]).map(([cle, o]) => (
          <section key={cle} id={o.ancre} aria-labelledby={`titre-${o.ancre}`} className="scroll-mt-20 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <h2 id={`titre-${o.ancre}`} className="text-xl font-semibold text-ink">
              {o.titre}
            </h2>
            <p className="mb-5 mt-1 text-[0.95rem] text-ink-2">{typographie(descriptions[cle])}</p>
            <o.Composant />
          </section>
        ))}
      </div>
    </div>
  );
}
