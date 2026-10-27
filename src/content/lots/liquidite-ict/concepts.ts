import type { Concept } from "../../schema";

/** Concepts enseignés par le module « liquidite-ict » (suivis par les quiz et la maîtrise). */
export const concepts: Concept[] = [
  { id: "ict-liquidite-ecole", nom: "La liquidité au sens ICT", chapitre: "deux-sens-liquidite", prerequis: ["liquidite", "ordre-stop"] },
  { id: "ict-lecture-critique", nom: "Observer, interpréter, tester", chapitre: "deux-sens-liquidite", prerequis: [] },
  { id: "ict-bsl-ssl", nom: "Buy-side et sell-side liquidity", chapitre: "bsl-ssl", prerequis: ["ict-liquidite-ecole", "stop-loss"] },
  { id: "ict-points-swing", nom: "Sommets et creux de swing", chapitre: "bsl-ssl", prerequis: ["chandelier"] },
  { id: "ict-equal-highs-lows", nom: "Equal highs et equal lows", chapitre: "equal-highs-lows", prerequis: ["ict-bsl-ssl"] },
  { id: "ict-pdh-pdl", nom: "Plus haut et plus bas de la veille", chapitre: "pdh-pdl", prerequis: ["ict-bsl-ssl", "unite-de-temps"] },
  { id: "ict-pwh-pwl", nom: "Plus haut et plus bas de la semaine précédente", chapitre: "pwh-pwl", prerequis: ["ict-pdh-pdl"] },
  { id: "ict-sweep", nom: "Prise de liquidité (sweep)", chapitre: "liquidity-sweep", prerequis: ["ict-bsl-ssl"] },
  { id: "ict-sweep-cassure", nom: "Distinguer prise de liquidité et cassure", chapitre: "liquidity-sweep", prerequis: ["ict-sweep"] },
  { id: "ict-erl-irl", nom: "Liquidité externe et interne", chapitre: "erl-irl", prerequis: ["ict-sweep", "ict-points-swing"] },
  { id: "ict-sessions", nom: "Sessions de marché et conversions horaires", chapitre: "sessions-killzones", prerequis: ["volatilite"] },
  { id: "ict-killzones", nom: "Les killzones", chapitre: "sessions-killzones", prerequis: ["ict-sessions"] },
  { id: "ict-asian-range", nom: "L'Asian range", chapitre: "asian-range", prerequis: ["ict-killzones", "ict-sweep"] },
  { id: "ict-opens", nom: "Midnight open, daily open, weekly open", chapitre: "opens", prerequis: ["ict-sessions"] },
  { id: "ict-cbdr", nom: "Le CBDR et ses projections", chapitre: "cbdr", prerequis: ["ict-sessions"] },
  { id: "ict-power-of-three", nom: "Accumulation, manipulation, distribution", chapitre: "power-of-three", prerequis: ["ict-asian-range", "ict-opens"] },
  { id: "ict-judas-swing", nom: "Le Judas swing", chapitre: "judas-swing", prerequis: ["ict-power-of-three", "ict-sweep"] },
  { id: "ict-ote", nom: "L'Optimal Trade Entry", chapitre: "ote", prerequis: ["ict-points-swing", "rendement-risque"] },
  { id: "ict-temps-et-prix", nom: "Combiner temps et prix", chapitre: "temps-et-prix", prerequis: ["ict-killzones", "ict-pdh-pdl", "ict-sweep"] },
  { id: "ict-premium-discount", nom: "Premium, discount et équilibre d'un range", chapitre: "pd-arrays", prerequis: ["ict-points-swing"] },
  { id: "ict-pd-arrays", nom: "Les PD arrays", chapitre: "pd-arrays", prerequis: ["ict-premium-discount", "ict-erl-irl"] },
  { id: "ict-smt", nom: "La SMT divergence", chapitre: "smt-divergence", prerequis: ["ict-sweep", "ict-points-swing"] },
  { id: "ict-critique", nom: "Évaluer une méthode d'école", chapitre: "critiques-ict", prerequis: ["ict-lecture-critique"] },
  { id: "ict-protocole-test", nom: "Protocole de test d'un modèle", chapitre: "critiques-ict", prerequis: ["ict-lecture-critique", "esperance"] },
];
