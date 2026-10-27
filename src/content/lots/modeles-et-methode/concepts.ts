import type { Concept } from "../../schema";

/** Concepts enseignés par le module « modeles-et-methode » (suivis par les quiz et la maîtrise). */
export const concepts: Concept[] = [
  {
    id: "modele-fiche",
    nom: "La fiche d'un modèle de trading",
    chapitre: "modele-continuation",
    prerequis: ["stop-loss", "take-profit", "esperance"],
  },
  { id: "modele-continuation", nom: "Modèle : continuation de tendance", chapitre: "modele-continuation", prerequis: ["modele-fiche"] },
  {
    id: "modele-retournement-liquidite",
    nom: "Modèle : retournement après prise de liquidité",
    chapitre: "modele-retournement-liquidite",
    prerequis: ["modele-fiche", "stop-loss"],
  },
  { id: "modele-breakout-retest", nom: "Modèle : breakout et retest", chapitre: "modele-breakout-retest", prerequis: ["modele-fiche"] },
  { id: "modele-retracement-fvg", nom: "Modèle : retracement dans une FVG", chapitre: "modele-retracement-fvg", prerequis: ["modele-fiche"] },
  {
    id: "modele-order-block",
    nom: "Modèle : order block confirmé par la structure",
    chapitre: "modele-order-block",
    prerequis: ["modele-fiche"],
  },
  {
    id: "modele-sweep-mss",
    nom: "Modèle : sweep, MSS et displacement",
    chapitre: "modele-sweep-mss",
    prerequis: ["modele-fiche", "modele-retournement-liquidite"],
  },
  {
    id: "modele-compression-expansion",
    nom: "Modèle : compression suivie d'expansion",
    chapitre: "modele-compression-expansion",
    prerequis: ["modele-fiche", "volatilite"],
  },
  {
    id: "modele-sessions",
    nom: "Modèles de sessions (Londres, New York)",
    chapitre: "modele-sessions",
    prerequis: ["modele-fiche", "volatilite"],
  },
  { id: "strategie-testable", nom: "Stratégie testable", chapitre: "strategie-testable", prerequis: ["modele-fiche", "esperance"] },
  { id: "strategie-regle-objective", nom: "Règle objective", chapitre: "strategie-testable", prerequis: [] },
  { id: "backtest-surapprentissage", nom: "Surapprentissage", chapitre: "biais-de-backtest", prerequis: ["strategie-testable"] },
  { id: "backtest-anticipation", nom: "Biais d'anticipation", chapitre: "biais-de-backtest", prerequis: ["strategie-testable"] },
  { id: "backtest-survivant", nom: "Biais du survivant", chapitre: "biais-de-backtest", prerequis: ["strategie-testable"] },
  {
    id: "stats-indicateurs",
    nom: "Indicateurs d'une série de trades",
    chapitre: "lire-des-statistiques",
    prerequis: ["esperance", "taux-reussite"],
  },
  { id: "stats-echantillon", nom: "Taille d'échantillon", chapitre: "lire-des-statistiques", prerequis: ["stats-indicateurs"] },
  { id: "stats-incertitude", nom: "Intervalle d'incertitude", chapitre: "lire-des-statistiques", prerequis: ["stats-echantillon"] },
  {
    id: "demo-test-prospectif",
    nom: "Test prospectif en compte démo",
    chapitre: "du-backtest-au-demo",
    prerequis: ["strategie-testable"],
  },
  {
    id: "demo-criteres-passage",
    nom: "Critères de passage au compte réel",
    chapitre: "du-backtest-au-demo",
    prerequis: ["demo-test-prospectif", "stats-incertitude"],
  },
];
