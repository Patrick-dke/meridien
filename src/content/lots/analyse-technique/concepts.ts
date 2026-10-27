import type { Concept } from "../../schema";

/** Concepts enseignés par le module « analyse-technique » (suivis par les quiz et la maîtrise). */
export const concepts: Concept[] = [
  { id: "support-resistance", nom: "Supports et résistances", chapitre: "supports-resistances", prerequis: ["chandelier", "unite-de-temps"] },
  { id: "changement-de-polarite", nom: "Changement de rôle d'un niveau", chapitre: "supports-resistances", prerequis: ["support-resistance"] },
  { id: "tendance", nom: "Tendance haussière ou baissière", chapitre: "tendances", prerequis: ["unite-de-temps"] },
  { id: "ligne-de-tendance", nom: "Ligne de tendance et canal", chapitre: "tendances", prerequis: ["tendance"] },
  { id: "range", nom: "Le range", chapitre: "ranges", prerequis: ["support-resistance"] },
  { id: "sortie-de-range", nom: "Sortie de range et fausse cassure", chapitre: "ranges", prerequis: ["range"] },
  { id: "sommets-creux", nom: "Sommets et creux", chapitre: "structure-de-marche", prerequis: ["chandelier"] },
  { id: "structure-de-marche", nom: "Structure de marché", chapitre: "structure-de-marche", prerequis: ["sommets-creux", "tendance"] },
  { id: "figure-chartiste", nom: "Figures chartistes", chapitre: "figures-chartistes", prerequis: ["support-resistance", "sommets-creux"] },
  { id: "projection-figure", nom: "Confirmation et projection d'une figure", chapitre: "figures-chartistes", prerequis: ["figure-chartiste"] },
  { id: "moyenne-mobile", nom: "Moyennes mobiles simple et exponentielle", chapitre: "moyennes-mobiles", prerequis: ["chandelier"] },
  { id: "croisement-moyennes", nom: "Croisements de moyennes mobiles", chapitre: "moyennes-mobiles", prerequis: ["moyenne-mobile", "tendance"] },
  { id: "rsi", nom: "Le RSI", chapitre: "rsi", prerequis: ["moyenne-mobile"] },
  { id: "divergence", nom: "Divergences entre prix et indicateur", chapitre: "rsi", prerequis: ["rsi", "sommets-creux"] },
  { id: "atr", nom: "L'ATR et le vrai range", chapitre: "atr", prerequis: ["ohlc", "volatilite"] },
  { id: "stop-volatilite", nom: "Stop calé sur la volatilité", chapitre: "atr", prerequis: ["atr", "stop-loss", "taille-position"] },
  { id: "volume", nom: "Lecture du volume", chapitre: "volume", prerequis: ["liquidite", "chandelier"] },
  { id: "volume-relatif", nom: "Volume relatif", chapitre: "volume", prerequis: ["volume"] },
  { id: "retracement-fibonacci", nom: "Retracements de Fibonacci", chapitre: "fibonacci", prerequis: ["sommets-creux"] },
  { id: "confluence", nom: "Confluence de niveaux", chapitre: "fibonacci", prerequis: ["retracement-fibonacci", "support-resistance"] },
  { id: "analyse-multi-unites", nom: "Analyse sur plusieurs unités de temps", chapitre: "analyse-multi-unites", prerequis: ["unite-de-temps", "structure-de-marche"] },
  { id: "biais-de-selection", nom: "Biais de sélection et biais rétrospectif", chapitre: "limites-analyse-technique", prerequis: ["taux-reussite"] },
  { id: "limites-analyse-technique", nom: "Ce que l'analyse technique ne garantit pas", chapitre: "limites-analyse-technique", prerequis: ["esperance", "support-resistance"] },
];
