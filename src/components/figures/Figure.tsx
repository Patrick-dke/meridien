import { scenes } from "@/content/scenes";
import { Anatomie } from "./Anatomie";
import { Carnet } from "./Carnet";
import { GraphiqueBougies } from "./GraphiqueBougies";
import { GraphiqueInteractif } from "./GraphiqueInteractif";
import { Levier } from "./Levier";
import { SeuilRentabilite } from "./SeuilRentabilite";
import { Series } from "./Series";
import { UnitesDeTemps } from "./UnitesDeTemps";

/** Rend une scène par son identifiant. `etape` sert aux capsules animées. */
export function Visuel({ scene, etape }: { scene: string; etape?: number }) {
  const s = scenes[scene];
  if (!s) throw new Error(`Scène inconnue : ${scene}`);
  switch (s.kind) {
    case "bougies":
      return <GraphiqueBougies scene={s} etape={etape} />;
    case "anatomie":
      return <Anatomie description={s.description} etape={etape} />;
    case "carnet":
      return <Carnet scene={s} etape={etape} />;
    case "unites-de-temps":
      return <UnitesDeTemps scene={s} etape={etape} />;
    case "levier":
      return <Levier scene={s} etape={etape} />;
    case "seuil-rentabilite":
      return <SeuilRentabilite description={s.description} etape={etape} />;
    case "series":
      return <Series scene={s} etape={etape} />;
  }
}

/** Figure de cours : visuel (explorable s'il s'agit de chandeliers), légende et provenance des données. */
export function Figure({ scene, legende }: { scene: string; legende: string }) {
  const s = scenes[scene];
  const synthetique = s && (s.kind === "bougies" || s.kind === "carnet" || s.kind === "unites-de-temps" || s.kind === "series");
  return (
    <figure className="carte my-7 max-w-2xl p-3 sm:p-4">
      {s?.kind === "bougies" ? <GraphiqueInteractif scene={s} /> : <Visuel scene={scene} />}
      <figcaption className="mt-3 border-t border-line px-1 pt-3 text-sm leading-relaxed text-ink-2">
        {legende}
        {synthetique ? (
          <span className="mt-1 block text-xs text-ink-3">Données synthétiques à but pédagogique, pas un marché réel.</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
