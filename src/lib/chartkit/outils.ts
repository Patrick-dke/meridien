import type { Bougie, Couleur } from "./types";

/** Générateur pseudo-aléatoire déterministe : la même graine donne toujours le même graphique. */
export function aleatoire(graine: number) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Marche aléatoire de bougies cohérentes. `derive` oriente la tendance (en part de `vol`),
 * `vol` fixe l'amplitude moyenne d'une bougie.
 */
export function marcheAleatoire(options: {
  graine: number;
  n: number;
  depart: number;
  vol: number;
  derive?: number;
  decimales: number;
}): Bougie[] {
  const r = aleatoire(options.graine);
  const facteur = 10 ** options.decimales;
  const arrondi = (x: number) => Math.round(x * facteur) / facteur;
  const bougies: Bougie[] = [];
  let prix = options.depart;
  for (let i = 0; i < options.n; i++) {
    const o = prix;
    const corps = (r() - 0.5 + (options.derive ?? 0)) * options.vol * 1.6;
    const c = o + corps;
    const h = Math.max(o, c) + r() * options.vol * 0.6;
    const l = Math.min(o, c) - r() * options.vol * 0.6;
    bougies.push({ o: arrondi(o), h: arrondi(h), l: arrondi(l), c: arrondi(c) });
    prix = c;
  }
  return bougies;
}

/**
 * Bougies écrites à la main à partir de leurs clôtures : chaque ouverture reprend la clôture précédente,
 * les mèches dépassent le corps de `meche` (une valeur ou une par bougie).
 */
export function depuisClotures(depart: number, clotures: number[], meche: number | number[], decimales: number): Bougie[] {
  const facteur = 10 ** decimales;
  const arrondi = (x: number) => Math.round(x * facteur) / facteur;
  return clotures.map((c, i) => {
    const o = i === 0 ? depart : clotures[i - 1];
    const m = Array.isArray(meche) ? meche[i % meche.length] : meche;
    return { o: arrondi(o), h: arrondi(Math.max(o, c) + m), l: arrondi(Math.min(o, c) - m), c: arrondi(c) };
  });
}

/** Regroupe des bougies : ouverture de la première, extrêmes du groupe, clôture de la dernière. */
export function regrouper(bougies: Bougie[], taille: number): Bougie[] {
  const resultat: Bougie[] = [];
  for (let i = 0; i < bougies.length; i += taille) {
    const groupe = bougies.slice(i, i + taille);
    resultat.push({
      o: groupe[0].o,
      h: Math.max(...groupe.map((b) => b.h)),
      l: Math.min(...groupe.map((b) => b.l)),
      c: groupe[groupe.length - 1].c,
    });
  }
  return resultat;
}

export function bougieValide(b: Bougie) {
  return b.h >= Math.max(b.o, b.c) && b.l <= Math.min(b.o, b.c) && [b.o, b.h, b.l, b.c].every(Number.isFinite);
}

/** Graduations « rondes » entre deux bornes. */
export function graduations(min: number, max: number, cible = 5) {
  const brut = (max - min) / cible;
  const puissance = 10 ** Math.floor(Math.log10(brut));
  const pas = [1, 2, 2.5, 5, 10].map((m) => m * puissance).find((p) => p >= brut) ?? brut;
  const debut = Math.ceil(min / pas) * pas;
  const valeurs: number[] = [];
  for (let v = debut; v <= max + pas * 1e-9; v += pas) valeurs.push(Number(v.toFixed(10)));
  return valeurs;
}

export function formatPrix(valeur: number, decimales: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valeur);
}

export const couleurCss: Record<Couleur, string> = {
  bull: "var(--bull)",
  bear: "var(--bear)",
  brand: "var(--brand)",
  gold: "var(--gold)",
  info: "var(--info)",
  ink: "var(--ink)",
  ok: "var(--ok)",
  warn: "var(--warn)",
  bad: "var(--bad)",
};
