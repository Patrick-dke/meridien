import type { Concept } from "../../schema";

/** Concepts enseignés par le module « smart-money-concepts » (suivis par les quiz et la maîtrise). */
export const concepts: Concept[] = [
  { id: "smc-statut", nom: "Statut des SMC : une école d'interprétation", chapitre: "smc-statut", prerequis: ["chandelier"] },
  { id: "smc-observable", nom: "Observable, lecture d'école et hypothèse", chapitre: "smc-statut", prerequis: ["chandelier"] },
  { id: "smc-swing", nom: "Swings : sommets et creux", chapitre: "swings-structure", prerequis: ["chandelier"] },
  { id: "smc-structure", nom: "Structure HH, HL, LH, LL", chapitre: "swings-structure", prerequis: ["smc-swing"] },
  { id: "smc-structure-interne-externe", nom: "Structure interne et structure externe", chapitre: "structure-interne-externe", prerequis: ["smc-structure"] },
  { id: "smc-inducement", nom: "L'inducement", chapitre: "structure-interne-externe", prerequis: ["smc-structure-interne-externe"] },
  { id: "smc-bos", nom: "Le BOS (cassure de structure)", chapitre: "bos", prerequis: ["smc-structure"] },
  { id: "smc-cloture-meche", nom: "Cassure par clôture ou par mèche", chapitre: "bos", prerequis: ["chandelier"] },
  { id: "smc-choch", nom: "Le CHoCH (changement de caractère)", chapitre: "choch", prerequis: ["smc-bos"] },
  { id: "smc-mss", nom: "Le MSS (market structure shift)", chapitre: "mss", prerequis: ["smc-choch"] },
  { id: "smc-displacement", nom: "Le displacement", chapitre: "displacement", prerequis: ["chandelier", "volatilite"] },
  { id: "smc-fvg", nom: "Les fair value gaps", chapitre: "fair-value-gap", prerequis: ["ohlc", "smc-displacement"] },
  { id: "smc-ifvg", nom: "Les inverse fair value gaps", chapitre: "inverse-fvg", prerequis: ["smc-fvg"] },
  { id: "smc-bpr", nom: "Les balanced price ranges", chapitre: "balanced-price-range", prerequis: ["smc-fvg"] },
  { id: "smc-order-block", nom: "Les order blocks", chapitre: "order-blocks", prerequis: ["smc-bos", "smc-displacement"] },
  { id: "smc-breaker", nom: "Les breaker blocks", chapitre: "breaker-blocks", prerequis: ["smc-order-block", "smc-mss"] },
  { id: "smc-mitigation-block", nom: "Les mitigation blocks", chapitre: "mitigation-blocks", prerequis: ["smc-order-block", "smc-breaker"] },
  { id: "smc-premium-discount", nom: "Premium, discount et équilibre", chapitre: "premium-discount", prerequis: ["smc-swing"] },
  { id: "smc-confluence", nom: "Confluence et hiérarchie des signaux", chapitre: "confluence", prerequis: ["smc-premium-discount", "smc-order-block", "smc-fvg"] },
  { id: "smc-critiques", nom: "Critiques et limites des SMC", chapitre: "critiques-smc", prerequis: ["smc-statut"] },
  { id: "smc-test", nom: "Rendre une règle SMC testable", chapitre: "critiques-smc", prerequis: ["smc-observable", "esperance"] },
];
