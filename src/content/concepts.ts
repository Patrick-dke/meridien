import type { Concept } from "./schema";

/**
 * Concepts suivis par le moteur de maîtrise. `chapitre` est le chapitre qui enseigne le concept ;
 * `prerequis` sert à la règle R2 (revoir d'abord une base fragile).
 */
export const concepts: Concept[] = [
  { id: "trading", nom: "Le trading", chapitre: "quest-ce-que-le-trading", prerequis: [] },
  { id: "risque-de-perte", nom: "Le risque de perte", chapitre: "quest-ce-que-le-trading", prerequis: [] },
  { id: "position-longue-courte", nom: "Positions acheteuse et vendeuse", chapitre: "quest-ce-que-le-trading", prerequis: ["trading"] },
  { id: "investissement", nom: "Trading et investissement", chapitre: "trading-et-investissement", prerequis: ["trading"] },
  { id: "horizon", nom: "Horizon de temps", chapitre: "trading-et-investissement", prerequis: [] },
  { id: "offre-demande", nom: "Offre et demande", chapitre: "formation-des-prix", prerequis: [] },
  { id: "carnet-ordres", nom: "Carnet d'ordres", chapitre: "formation-des-prix", prerequis: ["offre-demande"] },
  { id: "bid-ask", nom: "Prix acheteur et prix vendeur", chapitre: "formation-des-prix", prerequis: ["carnet-ordres"] },
  { id: "participants", nom: "Les participants du marché", chapitre: "participants-du-marche", prerequis: ["trading"] },
  { id: "courtier", nom: "Le rôle du courtier", chapitre: "participants-du-marche", prerequis: [] },
  { id: "liquidite", nom: "Liquidité (au sens du marché)", chapitre: "liquidite-et-volatilite", prerequis: ["carnet-ordres"] },
  { id: "volatilite", nom: "Volatilité", chapitre: "liquidite-et-volatilite", prerequis: [] },
  { id: "chandelier", nom: "Lecture d'un chandelier", chapitre: "chandeliers-japonais", prerequis: [] },
  { id: "ohlc", nom: "Ouverture, plus haut, plus bas, clôture", chapitre: "chandeliers-japonais", prerequis: [] },
  { id: "unite-de-temps", nom: "Unités de temps", chapitre: "unites-de-temps", prerequis: ["chandelier"] },
  { id: "ordre-marche", nom: "Ordre au marché", chapitre: "types-ordres", prerequis: ["bid-ask"] },
  { id: "ordre-limite", nom: "Ordre limite", chapitre: "types-ordres", prerequis: ["bid-ask"] },
  { id: "ordre-stop", nom: "Ordre stop", chapitre: "types-ordres", prerequis: ["ordre-marche"] },
  { id: "stop-loss", nom: "Stop Loss", chapitre: "stop-loss-take-profit", prerequis: ["ordre-stop"] },
  { id: "take-profit", nom: "Take Profit", chapitre: "stop-loss-take-profit", prerequis: ["ordre-limite"] },
  { id: "spread", nom: "Spread", chapitre: "couts-du-trading", prerequis: ["bid-ask"] },
  { id: "commission", nom: "Commission", chapitre: "couts-du-trading", prerequis: [] },
  { id: "slippage", nom: "Slippage", chapitre: "couts-du-trading", prerequis: ["ordre-marche", "liquidite"] },
  { id: "pip", nom: "Pip et point", chapitre: "pips-points-lots", prerequis: [] },
  { id: "lot", nom: "Lot et taille de contrat", chapitre: "pips-points-lots", prerequis: [] },
  { id: "valeur-pip", nom: "Valeur d'un pip", chapitre: "pips-points-lots", prerequis: ["pip", "lot"] },
  { id: "marge", nom: "Marge", chapitre: "marge-et-levier", prerequis: ["lot"] },
  { id: "levier", nom: "Effet de levier", chapitre: "marge-et-levier", prerequis: ["marge"] },
  { id: "risque-par-trade", nom: "Risque par opération", chapitre: "risque-et-taille-de-position", prerequis: ["stop-loss"] },
  { id: "taille-position", nom: "Taille de position", chapitre: "risque-et-taille-de-position", prerequis: ["risque-par-trade", "valeur-pip"] },
  { id: "rendement-risque", nom: "Ratio rendement/risque", chapitre: "rendement-risque-esperance", prerequis: ["stop-loss", "take-profit"] },
  { id: "taux-reussite", nom: "Taux de réussite", chapitre: "rendement-risque-esperance", prerequis: [] },
  { id: "esperance", nom: "Espérance mathématique", chapitre: "rendement-risque-esperance", prerequis: ["rendement-risque", "taux-reussite"] },
];

export const conceptParId = new Map(concepts.map((c) => [c.id, c]));
