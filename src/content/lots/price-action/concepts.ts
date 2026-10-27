import type { Concept } from "../../schema";

/** Concepts enseignés par le module « price-action » (suivis par les quiz et la maîtrise). */
export const concepts: Concept[] = [
  { id: "rejet", nom: "Rejet et lecture des mèches", chapitre: "rejets-et-meches", prerequis: ["chandelier", "ohlc"] },
  { id: "engulfing", nom: "Bougie englobante (engulfing)", chapitre: "engulfing", prerequis: ["chandelier"] },
  { id: "pin-bar", nom: "Pin bar", chapitre: "pin-bar", prerequis: ["rejet"] },
  { id: "inside-bar", nom: "Inside bar et bougie mère", chapitre: "inside-bar", prerequis: ["chandelier"] },
  { id: "breakout", nom: "Breakout : la cassure d'un niveau", chapitre: "breakout", prerequis: ["chandelier"] },
  { id: "retest", nom: "Retest d'un niveau cassé", chapitre: "retest", prerequis: ["breakout"] },
  { id: "faux-breakout", nom: "Faux breakout", chapitre: "faux-breakout", prerequis: ["breakout", "rejet"] },
  { id: "continuation", nom: "Configurations de continuation", chapitre: "continuation", prerequis: ["breakout"] },
  { id: "retournement", nom: "Configurations de retournement", chapitre: "retournement", prerequis: ["rejet", "engulfing"] },
  { id: "compression", nom: "Compression de la volatilité", chapitre: "compression", prerequis: ["volatilite", "inside-bar"] },
  { id: "expansion", nom: "Expansion de la volatilité", chapitre: "expansion", prerequis: ["compression"] },
  { id: "momentum", nom: "Momentum : l'élan du prix", chapitre: "momentum", prerequis: ["chandelier"] },
  { id: "contexte-de-marche", nom: "Lire le contexte avant le signal", chapitre: "contexte-avant-signal", prerequis: ["rejet", "breakout"] },
  { id: "invalidation", nom: "Niveau d'invalidation", chapitre: "contexte-avant-signal", prerequis: ["stop-loss"] },
  { id: "lecture-price-action", nom: "Grille de lecture Price Action", chapitre: "synthese-price-action", prerequis: ["contexte-de-marche", "momentum"] },
];
