import type { ModulePresente } from "@/components/offre/Offre";
import { fiche } from "./index";
import { offre, type ModuleOffre } from "./offre";

/** Ce que les pages transmettent d'un module de l'offre : structure et identité visuelle, sans prix. */
export function presenter(m: ModuleOffre): ModulePresente {
  const premiere = fiche(m.chapitres[0])!;
  return { id: m.id, titre: m.titre, accroche: m.accroche, rang: m.rang, gratuit: m.gratuit, chapitres: m.chapitres, motif: premiere.motif, teinte: premiere.teinte };
}

export const modulesPresentes = offre.map(presenter);

/** Titres des chapitres d'un module, tirés du catalogue public. */
export const programme = (m: ModuleOffre) => m.chapitres.map((slug, i) => ({ slug, numero: i + 1, titre: fiche(slug)?.titre ?? slug }));
