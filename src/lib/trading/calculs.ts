/**
 * Calculs de trading utilisés par les cours, les figures et les calculateurs.
 * Fonctions pures, sans arrondi caché : l'affichage arrondit, pas le calcul.
 */

export type Sens = "achat" | "vente";

/** Taux de réussite minimal pour ne pas perdre, sans frais : 1 / (1 + R). */
export function seuilRentabilite(ratio: number) {
  return 1 / (1 + ratio);
}

/**
 * Même seuil quand chaque trade coûte `fraisR` (en fraction de R) :
 * gain net = R − f, perte nette = 1 + f, d'où p = (1 + f) / (1 + R).
 */
export function seuilRentabiliteAvecFrais(ratio: number, fraisR: number) {
  return (1 + fraisR) / (1 + ratio);
}

/** Espérance par trade, en R : p × gain moyen − (1 − p) × perte moyenne. */
export function esperance(tauxReussite: number, gainMoyen: number, perteMoyenne: number) {
  return tauxReussite * gainMoyen - (1 - tauxReussite) * perteMoyenne;
}

/** Longueur de la plus longue série de résultats négatifs consécutifs. */
export function plusLongueSerie(resultats: number[]) {
  let max = 0;
  let courante = 0;
  for (const r of resultats) {
    courante = r < 0 ? courante + 1 : 0;
    max = Math.max(max, courante);
  }
  return max;
}

export type ErreurCalcul = { erreur: string };

/** Ratio rendement/risque d'un plan de trade, avec contrôle de cohérence des niveaux. */
export function ratioRendementRisque(p: { sens: Sens; entree: number; stop: number; objectif: number }):
  | { ratio: number; risque: number; rendement: number }
  | ErreurCalcul {
  const valeurs = [p.entree, p.stop, p.objectif];
  if (valeurs.some((v) => !Number.isFinite(v) || v <= 0)) return { erreur: "Les trois prix doivent être positifs." };
  if (p.sens === "achat" && !(p.stop < p.entree && p.entree < p.objectif)) {
    return { erreur: "À l'achat, le stop doit être sous l'entrée et l'objectif au-dessus." };
  }
  if (p.sens === "vente" && !(p.objectif < p.entree && p.entree < p.stop)) {
    return { erreur: "À la vente, le stop doit être au-dessus de l'entrée et l'objectif en dessous." };
  }
  const risque = Math.abs(p.entree - p.stop);
  const rendement = Math.abs(p.objectif - p.entree);
  return { ratio: rendement / risque, risque, rendement };
}

/** Arrondi vers le bas à `pas` près, insensible aux erreurs de virgule flottante (0,29999… → 0,30). */
export function arrondiInferieur(valeur: number, pas: number) {
  return Math.floor(valeur / pas + 1e-9) * pas;
}

/**
 * Taille de position quand le stop est exprimé en prix (actions, cryptomonnaies, indices en points).
 * `valeurParUnite` = gain ou perte pour 1 de variation de prix et 1 unité de position (1 pour une action).
 */
export function taillePositionPrix(p: {
  capital: number;
  risquePct: number;
  entree: number;
  stop: number;
  valeurParUnite?: number;
  pasQuantite?: number;
}):
  | { montantRisque: number; distance: number; quantite: number; quantiteArrondie: number; risqueEffectif: number }
  | ErreurCalcul {
  if (!(p.capital > 0)) return { erreur: "Le capital doit être positif." };
  if (!(p.risquePct > 0 && p.risquePct <= 100)) return { erreur: "Le risque doit être compris entre 0 et 100 %." };
  const distance = Math.abs(p.entree - p.stop);
  if (!(distance > 0)) return { erreur: "Le stop doit être différent du prix d'entrée." };
  const valeur = p.valeurParUnite ?? 1;
  const montantRisque = (p.capital * p.risquePct) / 100;
  const quantite = montantRisque / (distance * valeur);
  const quantiteArrondie = arrondiInferieur(quantite, p.pasQuantite ?? 1);
  return { montantRisque, distance, quantite, quantiteArrondie, risqueEffectif: quantiteArrondie * distance * valeur };
}

/** Taille de position en lots (Forex) à partir du stop en pips et de la valeur d'un pip pour un lot. */
export function tailleLots(p: { capital: number; risquePct: number; stopPips: number; valeurPipParLot: number; pasLot?: number }):
  | { montantRisque: number; lots: number; lotsArrondis: number; risqueEffectif: number }
  | ErreurCalcul {
  if (!(p.capital > 0)) return { erreur: "Le capital doit être positif." };
  if (!(p.risquePct > 0 && p.risquePct <= 100)) return { erreur: "Le risque doit être compris entre 0 et 100 %." };
  if (!(p.stopPips > 0)) return { erreur: "Le stop doit faire au moins quelques pips." };
  if (!(p.valeurPipParLot > 0)) return { erreur: "La valeur du pip doit être positive." };
  const montantRisque = (p.capital * p.risquePct) / 100;
  const lots = montantRisque / (p.stopPips * p.valeurPipParLot);
  const lotsArrondis = arrondiInferieur(lots, p.pasLot ?? 0.01);
  return { montantRisque, lots, lotsArrondis, risqueEffectif: lotsArrondis * p.stopPips * p.valeurPipParLot };
}

/**
 * Valeur d'un pip pour un lot, dans la devise du compte.
 * `conversion` = valeur d'une unité de devise de cotation dans la devise du compte (1 si identiques).
 */
export function valeurPipParLot(p: { taillePip: number; tailleContrat: number; conversion: number }) {
  return p.taillePip * p.tailleContrat * p.conversion;
}

/** Nombre de pips entre deux prix. */
export function pipsEntre(a: number, b: number, taillePip: number) {
  return Math.round((Math.abs(a - b) / taillePip) * 10) / 10;
}

/** Marge requise pour une position : taille ÷ levier. */
export function margeRequise(taillePosition: number, levier: number) {
  return taillePosition / levier;
}

/** Perte (en % du capital) pour une variation défavorable du prix, quand toute la marge permise est utilisée. */
export function perteSurCapitalPct(levier: number, variationPct: number) {
  return levier * variationPct;
}

/**
 * Probabilité exacte de connaître au moins une série de `k` pertes consécutives sur `n` trades
 * indépendants, chaque trade perdant avec la probabilité `q`. Programmation dynamique sur la longueur
 * de la série en cours.
 */
export function probabiliteSerieDePertes(n: number, k: number, q: number) {
  if (k <= 0) return 1;
  if (k > n) return 0;
  let etats = new Array<number>(k).fill(0);
  etats[0] = 1;
  let atteinte = 0;
  for (let t = 0; t < n; t++) {
    const suivants = new Array<number>(k).fill(0);
    for (let r = 0; r < k; r++) {
      const p = etats[r];
      if (p === 0) continue;
      suivants[0] += p * (1 - q);
      if (r + 1 === k) atteinte += p * q;
      else suivants[r + 1] += p * q;
    }
    etats = suivants;
  }
  return atteinte;
}

/** Gain nécessaire pour effacer une baisse : 20 % de baisse demandent 25 % de hausse. */
export function gainPourRecuperer(baisse: number) {
  return baisse / (1 - baisse);
}
