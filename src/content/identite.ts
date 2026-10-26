/**
 * Classement transversal du catalogue : académie → marché → stratégie → module → chapitre → leçon (les étapes).
 * Marchés et stratégies sont des étiquettes, pas des dossiers : un chapitre fondamental vaut pour tous les
 * marchés et n'est jamais dupliqué. Le niveau d'un module est le niveau prévu de ses chapitres ; un chapitre
 * publié porte son propre niveau.
 */
export type Marche = "forex" | "crypto" | "indices" | "actions" | "matieres-premieres";
export type Strategie = "fondamentaux" | "analyse-technique" | "gestion-du-risque" | "psychologie" | "price-action" | "smc" | "ict" | "modeles";
export type Motif = "globe" | "marches" | "bougies" | "tendance" | "risque" | "onde" | "bouclier" | "meche" | "structure" | "liquidite" | "modeles" | "methode";

export const libellesMarches: Record<Marche, string> = {
  forex: "Forex",
  crypto: "Cryptomonnaies",
  indices: "Indices",
  actions: "Actions",
  "matieres-premieres": "Matières premières",
};

export const libellesStrategies: Record<Strategie, string> = {
  fondamentaux: "Fondamentaux",
  "analyse-technique": "Analyse technique",
  "gestion-du-risque": "Gestion du risque",
  psychologie: "Psychologie",
  "price-action": "Price Action",
  smc: "Smart Money Concepts",
  ict: "ICT",
  modeles: "Modèles et méthode",
};

/** Teinte de chaque académie : elle colore ses cartes, ses vignettes et l'en-tête de ses chapitres. */
export const teintesAcademies: Record<string, string> = {
  fondamentaux: "#8f84ff",
  "price-action": "#45d7f2",
  "smart-money-concepts": "#c38bff",
  "liquidite-ict": "#f5c463",
  "modeles-et-methode": "#ff9f7a",
};

export const motifsAcademies: Record<string, Motif> = {
  fondamentaux: "globe",
  "price-action": "meche",
  "smart-money-concepts": "structure",
  "liquidite-ict": "liquidite",
  "modeles-et-methode": "modeles",
};

export const identiteModules: Record<string, { motif: Motif; strategie: Strategie; niveau: number }> = {
  introduction: { motif: "globe", strategie: "fondamentaux", niveau: 1 },
  marches: { motif: "marches", strategie: "fondamentaux", niveau: 1 },
  "outils-du-trader": { motif: "bougies", strategie: "fondamentaux", niveau: 2 },
  "analyse-technique": { motif: "tendance", strategie: "analyse-technique", niveau: 2 },
  "gestion-du-risque": { motif: "risque", strategie: "gestion-du-risque", niveau: 2 },
  psychologie: { motif: "onde", strategie: "psychologie", niveau: 2 },
  "se-proteger": { motif: "bouclier", strategie: "fondamentaux", niveau: 1 },
  "lecture-du-prix": { motif: "meche", strategie: "price-action", niveau: 3 },
  smc: { motif: "structure", strategie: "smc", niveau: 4 },
  ict: { motif: "liquidite", strategie: "ict", niveau: 5 },
  modeles: { motif: "modeles", strategie: "modeles", niveau: 4 },
  methode: { motif: "methode", strategie: "modeles", niveau: 4 },
};

/** Chapitres propres à un marché ; tous les autres valent pour tous les marchés. */
export const marchesChapitres: Record<string, Marche[]> = {
  "forex-fonctionnement": ["forex"],
  "forex-horaires-couts": ["forex"],
  "crypto-fonctionnement": ["crypto"],
  "crypto-horaires-couts": ["crypto"],
  "indices-fonctionnement": ["indices"],
  "indices-horaires-couts": ["indices"],
  "actions-fonctionnement": ["actions"],
  "actions-horaires-couts": ["actions"],
  "matieres-premieres-fonctionnement": ["matieres-premieres"],
  "matieres-premieres-horaires-couts": ["matieres-premieres"],
  "modele-sessions": ["forex", "indices"],
};
