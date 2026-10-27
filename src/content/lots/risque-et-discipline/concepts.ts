import type { Concept } from "../../schema";

/** Concepts enseignés par le module « risque-et-discipline » (suivis par les quiz et la maîtrise). */
export const concepts: Concept[] = [
  // Gestion du risque
  { id: "capital-de-trading", nom: "Le capital de trading", chapitre: "capital-et-survie", prerequis: ["risque-de-perte"] },
  { id: "regle-de-survie", nom: "La règle de survie", chapitre: "capital-et-survie", prerequis: ["capital-de-trading", "risque-par-trade"] },
  { id: "series-de-pertes", nom: "Les séries de pertes", chapitre: "series-de-pertes", prerequis: ["taux-reussite", "risque-par-trade"] },
  { id: "drawdown", nom: "Le drawdown", chapitre: "drawdown", prerequis: ["risque-par-trade"] },
  { id: "gain-de-recuperation", nom: "Le gain nécessaire pour récupérer", chapitre: "drawdown", prerequis: ["drawdown"] },
  { id: "correlation-positions", nom: "La corrélation entre positions", chapitre: "correlation", prerequis: ["risque-par-trade"] },
  { id: "risque-cumule", nom: "Le risque cumulé des positions ouvertes", chapitre: "correlation", prerequis: ["correlation-positions", "taille-position"] },
  { id: "risque-de-ruine", nom: "Le risque de ruine", chapitre: "risque-de-ruine", prerequis: ["esperance", "risque-par-trade", "series-de-pertes"] },
  { id: "journal-de-trading", nom: "Le journal de trading", chapitre: "journal-de-trading", prerequis: ["rendement-risque"] },
  { id: "resultat-en-r", nom: "Le résultat exprimé en R", chapitre: "journal-de-trading", prerequis: ["rendement-risque", "risque-par-trade"] },
  { id: "plan-de-trading", nom: "Le plan de trading", chapitre: "plan-de-trading", prerequis: ["risque-par-trade", "journal-de-trading"] },
  // Psychologie et discipline
  { id: "biais-cognitifs", nom: "Les biais cognitifs", chapitre: "biais-cognitifs", prerequis: [] },
  { id: "aversion-aux-pertes", nom: "L'aversion aux pertes", chapitre: "biais-cognitifs", prerequis: ["biais-cognitifs", "stop-loss"] },
  { id: "surtrading", nom: "Le surtrading", chapitre: "surtrading", prerequis: ["plan-de-trading", "commission", "spread"] },
  { id: "trading-de-revanche", nom: "Le trading de revanche", chapitre: "trading-de-revanche", prerequis: ["series-de-pertes", "risque-par-trade"] },
  { id: "limite-de-perte", nom: "La limite de perte journalière", chapitre: "trading-de-revanche", prerequis: ["risque-par-trade"] },
  { id: "routine-de-trading", nom: "La routine de trading", chapitre: "routines", prerequis: ["plan-de-trading"] },
  { id: "reprise-apres-pertes", nom: "Traverser une série de pertes", chapitre: "traverser-une-serie-de-pertes", prerequis: ["series-de-pertes", "drawdown", "journal-de-trading"] },
  { id: "attentes-realistes", nom: "Des attentes réalistes", chapitre: "attentes-realistes", prerequis: ["esperance"] },
  { id: "variance-resultats", nom: "La part du hasard dans les résultats", chapitre: "attentes-realistes", prerequis: ["esperance", "series-de-pertes"] },
  // Se protéger
  { id: "regulation-courtiers", nom: "La régulation des courtiers", chapitre: "regulation-et-courtiers", prerequis: ["courtier"] },
  { id: "verification-courtier", nom: "Vérifier un courtier", chapitre: "regulation-et-courtiers", prerequis: ["regulation-courtiers"] },
  { id: "usage-compte-demo", nom: "Bien utiliser un compte démo", chapitre: "compte-demo", prerequis: ["plan-de-trading", "taille-position"] },
  { id: "arnaques-trading", nom: "Reconnaître une arnaque", chapitre: "arnaques-courantes", prerequis: ["attentes-realistes", "regulation-courtiers"] },
  { id: "risques-derives", nom: "Les produits dérivés et leurs risques", chapitre: "produits-derives", prerequis: ["levier", "marge"] },
  { id: "reperes-fiscaux", nom: "Les repères fiscaux du trader", chapitre: "fiscalite-reperes", prerequis: ["journal-de-trading"] },
];
