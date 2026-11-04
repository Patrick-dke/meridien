import { marcheAleatoire } from "@/lib/chartkit/outils";
import type { Bougie } from "@/lib/chartkit/types";
import { convertir, type Devise } from "./devises";

/**
 * Compte d'entraînement : un marché SYNTHÉTIQUE (marche aléatoire reproductible) rejoué bougie par bougie.
 * Rien n'y reflète un cours réel ; on y apprend la mécanique (ordres, stop, marge, conversion de devises).
 */
export type Instrument = {
  symbole: string;
  nom: string;
  /** Devise de base (la première du couple) ; absente pour l'or et l'indice. */
  base?: Devise;
  /** Devise de cotation : le résultat se calcule d'abord dans elle. */
  cotation: Devise;
  /** Taille d'un lot standard (unités, onces, points). */
  contrat: number;
  taillePip: number;
  decimales: number;
  depart: number;
  vol: number;
};

export const INSTRUMENTS: Instrument[] = [
  { symbole: "EUR/USD", nom: "Euro contre dollar", base: "EUR", cotation: "USD", contrat: 100_000, taillePip: 0.0001, decimales: 5, depart: 1.085, vol: 0.0012 },
  { symbole: "GBP/USD", nom: "Livre contre dollar", base: "GBP", cotation: "USD", contrat: 100_000, taillePip: 0.0001, decimales: 5, depart: 1.27, vol: 0.0015 },
  { symbole: "USD/JPY", nom: "Dollar contre yen", base: "USD", cotation: "JPY", contrat: 100_000, taillePip: 0.01, decimales: 3, depart: 151.2, vol: 0.18 },
  { symbole: "EUR/GBP", nom: "Euro contre livre", base: "EUR", cotation: "GBP", contrat: 100_000, taillePip: 0.0001, decimales: 5, depart: 0.855, vol: 0.0008 },
  { symbole: "USD/CHF", nom: "Dollar contre franc suisse", base: "USD", cotation: "CHF", contrat: 100_000, taillePip: 0.0001, decimales: 5, depart: 0.89, vol: 0.0011 },
  { symbole: "USD/CAD", nom: "Dollar contre dollar canadien", base: "USD", cotation: "CAD", contrat: 100_000, taillePip: 0.0001, decimales: 5, depart: 1.36, vol: 0.0012 },
  { symbole: "XAU/USD", nom: "Or (once) en dollars", cotation: "USD", contrat: 100, taillePip: 0.1, decimales: 2, depart: 2350, vol: 6 },
  { symbole: "IDX-EUR", nom: "Indice fictif coté en euros", cotation: "EUR", contrat: 1, taillePip: 1, decimales: 1, depart: 18000, vol: 35 },
];
export const instrument = (symbole: string) => INSTRUMENTS.find((i) => i.symbole === symbole) ?? INSTRUMENTS[0];

/** Longueur du marché rejoué et nombre de bougies visibles au départ. */
export const LONGUEUR_SERIE = 800;
export const DEPART = 60;

export function serie(i: Instrument, graine: number): Bougie[] {
  return marcheAleatoire({ graine, n: LONGUEUR_SERIE, depart: i.depart, vol: i.vol, derive: 0, decimales: i.decimales });
}

export type Sens = "achat" | "vente";
export type Position = { id: string; symbole: string; sens: Sens; lots: number; entree: number; stop?: number; objectif?: number; ouverteA: number };
export type Fermeture = Position & { sortie: number; fermeeA: number; motif: "manuel" | "stop" | "objectif"; resultat: number; resultatR: number | null };

export type Compte = {
  devise: Devise;
  soldeInitial: number;
  /** Solde réalisé (positions fermées comprises). */
  solde: number;
  levier: number;
  graine: number;
  /** Indice de la dernière bougie visible, commun à tous les instruments. */
  index: number;
  positions: Position[];
  historique: Fermeture[];
};

export function nouveauCompte(devise: Devise, soldeInitial: number, levier: number, graine: number): Compte {
  return { devise, soldeInitial, solde: soldeInitial, levier, graine, index: DEPART, positions: [], historique: [] };
}

/** Chaque instrument a sa propre série, dérivée de la graine du compte. */
export const graineInstrument = (compte: Compte, i: Instrument) => compte.graine + INSTRUMENTS.indexOf(i) * 7919;

/** Résultat dans la devise de cotation : écart de prix × sens × lots × contrat. */
export function resultatCotation(p: Pick<Position, "sens" | "lots" | "entree">, prix: number, i: Instrument) {
  return (prix - p.entree) * (p.sens === "achat" ? 1 : -1) * p.lots * i.contrat;
}

/**
 * Montant de la devise de cotation vers la devise du compte. Si le compte est dans la devise de base du couple,
 * le prix de l'instrument lui-même sert de taux (cohérent avec le marché simulé) ; sinon taux de référence.
 */
export function versCompte(montant: number, i: Instrument, prix: number, devise: Devise, taux: Partial<Record<Devise, number>>): number | null {
  if (i.cotation === devise) return montant;
  if (i.base === devise) return montant / prix;
  return convertir(montant, i.cotation, devise, taux);
}

/** Marge immobilisée : valeur de la position (en devise du compte) ÷ levier. */
export function marge(p: Position, prix: number, i: Instrument, devise: Devise, levier: number, taux: Partial<Record<Devise, number>>) {
  const valeurCotation = p.lots * i.contrat * prix;
  const valeur = i.base === devise ? p.lots * i.contrat : versCompte(valeurCotation, i, prix, devise, taux);
  return valeur === null ? null : valeur / levier;
}

/** Résultat en R : multiple du risque initial (distance au stop), si un stop était posé. */
export function enR(p: Position, sortie: number) {
  if (p.stop === undefined || p.stop === p.entree) return null;
  return ((sortie - p.entree) * (p.sens === "achat" ? 1 : -1)) / Math.abs(p.entree - p.stop);
}

/**
 * Exécution sur une bougie : stop et objectif touchés par le plus haut ou le plus bas. Si un écart d'ouverture
 * les a déjà dépassés, l'ordre est servi à l'ouverture (glissement). Si les deux sont touchés dans la même bougie,
 * on retient le stop : on ne sait pas lequel est venu en premier, et la prudence l'emporte.
 */
export function sortieSurBougie(p: Position, b: Bougie): { prix: number; motif: "stop" | "objectif" } | null {
  const achat = p.sens === "achat";
  const stopTouche = p.stop !== undefined && (achat ? b.l <= p.stop : b.h >= p.stop);
  const objectifTouche = p.objectif !== undefined && (achat ? b.h >= p.objectif : b.l <= p.objectif);
  if (stopTouche) {
    const ecart = achat ? b.o < p.stop! : b.o > p.stop!;
    return { prix: ecart ? b.o : p.stop!, motif: "stop" };
  }
  if (objectifTouche) {
    const ecart = achat ? b.o > p.objectif! : b.o < p.objectif!;
    return { prix: ecart ? b.o : p.objectif!, motif: "objectif" };
  }
  return null;
}

/** Ferme une position au prix donné et met le solde à jour (résultat converti en devise du compte). */
export function fermer(compte: Compte, p: Position, prix: number, motif: Fermeture["motif"], taux: Partial<Record<Devise, number>>): Compte | null {
  const i = instrument(p.symbole);
  const resultat = versCompte(resultatCotation(p, prix, i), i, prix, compte.devise, taux);
  if (resultat === null) return null;
  const f: Fermeture = { ...p, sortie: prix, fermeeA: compte.index, motif, resultat, resultatR: enR(p, prix) };
  return { ...compte, solde: compte.solde + resultat, positions: compte.positions.filter((x) => x.id !== p.id), historique: [...compte.historique, f] };
}

/**
 * Avance le marché d'une bougie : chaque position ouverte peut être fermée par son stop ou son objectif.
 * Renvoie le compte et les fermetures du tour (pour le journal).
 */
export function avancer(compte: Compte, series: Record<string, Bougie[]>, taux: Partial<Record<Devise, number>>): { compte: Compte; fermees: Fermeture[] } {
  if (compte.index >= LONGUEUR_SERIE - 1) return { compte, fermees: [] };
  let suivant: Compte = { ...compte, index: compte.index + 1 };
  const fermees: Fermeture[] = [];
  for (const p of compte.positions) {
    const b = series[p.symbole]?.[suivant.index];
    if (!b) continue;
    const s = sortieSurBougie(p, b);
    if (!s) continue;
    const apres = fermer(suivant, p, s.prix, s.motif, taux);
    if (apres) {
      suivant = apres;
      fermees.push(apres.historique[apres.historique.length - 1]);
    }
  }
  return { compte: suivant, fermees };
}

/** Lots pour risquer `risquePct` du solde jusqu'au stop, arrondis vers le bas au centième de lot. */
export function lotsPourRisque(p: { solde: number; risquePct: number; entree: number; stop: number; i: Instrument; devise: Devise; taux: Partial<Record<Devise, number>> }) {
  const parLot = versCompte(Math.abs(p.entree - p.stop) * p.i.contrat, p.i, p.entree, p.devise, p.taux);
  if (!parLot || parLot <= 0) return null;
  // Tolérance d'arrondi : 0,002 vaut parfois 0,0020000000000002 en virgule flottante.
  return Math.floor(((p.solde * p.risquePct) / 100 / parLot) * 100 + 1e-9) / 100;
}
