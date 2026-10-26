import { academies, parcoursPremiersPas } from "./catalogue";
import { chapitre as c01 } from "./chapitres/01-quest-ce-que-le-trading";
import { chapitre as c02 } from "./chapitres/02-trading-et-investissement";
import { chapitre as c03 } from "./chapitres/03-formation-des-prix";
import { chapitre as c04 } from "./chapitres/04-participants-du-marche";
import { chapitre as c05 } from "./chapitres/05-liquidite-et-volatilite";
import { chapitre as c06 } from "./chapitres/06-chandeliers-japonais";
import { chapitre as c07 } from "./chapitres/07-unites-de-temps";
import { chapitre as c08 } from "./chapitres/08-types-ordres";
import { chapitre as c09 } from "./chapitres/09-stop-loss-take-profit";
import { chapitre as c10 } from "./chapitres/10-couts-du-trading";
import { chapitre as c11 } from "./chapitres/11-pips-points-lots";
import { chapitre as c12 } from "./chapitres/12-marge-et-levier";
import { chapitre as c13 } from "./chapitres/13-risque-et-taille-de-position";
import { chapitre as c14 } from "./chapitres/14-rendement-risque-esperance";
import type { Academie, Chapitre, Module } from "./schema";

/** Tous les chapitres rédigés, quel que soit leur statut (les tests les valident tous). */
export const tousLesChapitres: Chapitre[] = [c01, c02, c03, c04, c05, c06, c07, c08, c09, c10, c11, c12, c13, c14];

/** Seuls les chapitres publiés apparaissent sur le site. */
export const chapitresPublies = tousLesChapitres.filter((c) => c.statut === "publie");

const parSlug = new Map(chapitresPublies.map((c) => [c.slug, c]));

export function chapitre(slug: string) {
  return parSlug.get(slug);
}

export function estPublie(slug: string) {
  return parSlug.has(slug);
}

export function academie(slug: string) {
  return academies.find((a) => a.slug === slug);
}

export function module(academieSlug: string, moduleSlug: string) {
  return academie(academieSlug)?.modules.find((m) => m.slug === moduleSlug);
}

/** Position d'un chapitre dans le catalogue : académie, module et numéro. */
export function emplacement(slug: string): { academie: Academie; module: Module; numero: number } | undefined {
  for (const a of academies) {
    for (const m of a.modules) {
      const i = m.chapitres.findIndex((c) => c.slug === slug);
      if (i >= 0) return { academie: a, module: m, numero: i + 1 };
    }
  }
  return undefined;
}

/** Le parcours « Premiers pas », limité aux chapitres publiés. */
export const parcours = parcoursPremiersPas.filter(estPublie);

export function suivantDansParcours(slug: string) {
  const i = parcours.indexOf(slug);
  return i >= 0 && i < parcours.length - 1 ? chapitre(parcours[i + 1]) : undefined;
}

export const titresChapitres = new Map(chapitresPublies.map((c) => [c.slug, c.titre]));

export { academies, parcoursPremiersPas };
