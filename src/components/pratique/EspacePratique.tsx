"use client";

import { useEffect, useState } from "react";
import { typographie } from "@/lib/typographie";
import { outils } from "./CalculateurIntegre";
import { CompteEntrainement } from "./CompteEntrainement";
import { Journal } from "./Journal";

type Onglet = "compte" | "journal" | "calculateurs";

const ONGLETS: { id: Onglet; libelle: string; court: string }[] = [
  { id: "compte", libelle: "Compte d'entraînement", court: "Compte" },
  { id: "journal", libelle: "Journal de trading", court: "Journal" },
  { id: "calculateurs", libelle: "Calculateurs", court: "Calculateurs" },
];

const descriptions: Record<keyof typeof outils, string> = {
  position: "Combien acheter pour ne pas perdre plus que prévu si le stop est touché.",
  "rendement-risque": "Le ratio de ton plan et le taux de réussite minimal pour qu'il soit rentable, frais compris.",
  pips: "Mesurer un mouvement en pips et le traduire en argent selon la taille de position.",
  esperance: "Ce que rapporte une méthode en moyenne, et la probabilité de traverser une série de pertes.",
};

const ancresCalculateurs = new Set<string>(Object.values(outils).map((o) => o.ancre));

/** L'ancre de l'adresse choisit l'onglet : #journal, #compte, ou l'ancre d'un calculateur (#position…). */
function ongletDeAncre(ancre: string): Onglet | null {
  if (ancre === "compte" || ancre === "journal" || ancre === "calculateurs") return ancre;
  return ancresCalculateurs.has(ancre) ? "calculateurs" : null;
}

function Calculateurs() {
  return (
    <div>
      <p className="max-w-2xl text-ink-2">{typographie("Des calculs exacts à partir de tes hypothèses. Ils ne disent rien de ce que fera le marché.")}</p>
      <nav aria-label="Calculateurs" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {Object.values(outils).map((o) => (
          <a key={o.ancre} href={`#${o.ancre}`} className="lien">
            {o.titre.replace("Calculateur de ", "")}
          </a>
        ))}
      </nav>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {(Object.entries(outils) as [keyof typeof outils, (typeof outils)[keyof typeof outils]][]).map(([cle, o]) => (
          <section key={cle} id={o.ancre} aria-labelledby={`titre-${o.ancre}`} className="grid scroll-mt-24 gap-6 py-8 lg:grid-cols-[16rem_1fr]">
            <div>
              <h3 id={`titre-${o.ancre}`} className="text-xl text-ink">
                {o.titre}
              </h3>
              <p className="mt-1 text-[0.95rem] text-ink-2">{typographie(descriptions[cle])}</p>
            </div>
            <o.Composant />
          </section>
        ))}
      </div>
    </div>
  );
}

/** Trois espaces de pratique sous des onglets ; l'ancre de l'adresse garde l'onglet ouvert au rechargement. */
export function EspacePratique() {
  const [onglet, setOnglet] = useState<Onglet>("compte");

  useEffect(() => {
    const lire = () => {
      const ancre = decodeURIComponent(window.location.hash.slice(1));
      const o = ongletDeAncre(ancre);
      if (!o) return;
      setOnglet(o);
      if (ancresCalculateurs.has(ancre)) requestAnimationFrame(() => document.getElementById(ancre)?.scrollIntoView({ block: "start" }));
    };
    lire();
    window.addEventListener("hashchange", lire);
    return () => window.removeEventListener("hashchange", lire);
  }, []);

  const choisir = (o: Onglet) => {
    setOnglet(o);
    window.history.replaceState(null, "", `#${o}`);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Espaces de pratique"
        className="sticky top-[calc(3.5rem+1px)] z-20 -mx-4 flex gap-1 overflow-x-auto [scrollbar-width:none] border-b border-line bg-bg/92 px-4 backdrop-blur-md sm:mx-0 sm:px-0"
      >
        {ONGLETS.map((o, i) => {
          const actif = o.id === onglet;
          return (
            <button
              key={o.id}
              id={`onglet-${o.id}`}
              type="button"
              role="tab"
              aria-selected={actif}
              aria-controls={`panneau-${o.id}`}
              tabIndex={actif ? 0 : -1}
              onClick={() => choisir(o.id)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const suivant = ONGLETS[(i + (e.key === "ArrowRight" ? 1 : ONGLETS.length - 1)) % ONGLETS.length];
                choisir(suivant.id);
                document.getElementById(`onglet-${suivant.id}`)?.focus();
              }}
              className={`relative px-3 py-3 text-sm font-medium transition-colors active:scale-[0.97] ${actif ? "text-ink" : "text-ink-3 hover:text-ink"}`}
            >
              <span className="sm:hidden">{o.court}</span>
              <span className="hidden sm:inline">{o.libelle}</span>
              <span
                aria-hidden="true"
                className={`absolute inset-x-3 bottom-0 h-0.5 origin-center bg-accent transition-transform duration-300 ease-out ${actif ? "scale-x-100" : "scale-x-0"}`}
              />
            </button>
          );
        })}
      </div>

      <div id={`panneau-${onglet}`} role="tabpanel" aria-labelledby={`onglet-${onglet}`} className="etape-avant pt-8" key={onglet}>
        {onglet === "compte" ? <CompteEntrainement /> : onglet === "journal" ? <Journal /> : <Calculateurs />}
      </div>
    </div>
  );
}
