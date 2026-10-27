import { academies, parcoursPremiersPas } from "./catalogue";

/**
 * L'offre commerciale : des modules achetables, du plus accessible au plus avancé. Ce fichier ne contient
 * que la STRUCTURE (chapitres, compétences, niveau). Les prix et la publication sont en base de données
 * (collection `modules`), modifiables depuis l'administration : aucun prix n'est écrit dans l'interface.
 */
export type ModuleOffre = {
  id: string;
  titre: string;
  accroche: string;
  /** Rang de complexité : il fixe l'ordre de présentation et la grille tarifaire initiale. */
  rang: number;
  gratuit: boolean;
  competences: string[];
  chapitres: string[];
  academie: string;
};

const chapitresDe = (academie: string, modules: string[]) =>
  academies
    .find((a) => a.slug === academie)!
    .modules.filter((m) => modules.includes(m.slug))
    .flatMap((m) => m.chapitres.map((c) => c.slug));

const fondamentaux = (modules: string[]) => chapitresDe("fondamentaux", modules).filter((s) => !parcoursPremiersPas.includes(s));

export const offre: ModuleOffre[] = [
  {
    id: "premiers-pas",
    titre: "Premiers pas",
    accroche: "Partir de zéro : marchés, prix, chandeliers, ordres, coûts, levier et risque.",
    rang: 1,
    gratuit: true,
    academie: "fondamentaux",
    competences: ["Lire un graphique en chandeliers", "Passer les bons ordres", "Calculer coûts, pips et levier", "Dimensionner une position selon son risque"],
    chapitres: parcoursPremiersPas,
  },
  {
    id: "marches-et-plateformes",
    titre: "Marchés et plateformes",
    accroche: "Forex, cryptomonnaies, indices, actions, matières premières, et les plateformes pour les trader.",
    rang: 2,
    gratuit: false,
    academie: "fondamentaux",
    competences: ["Comprendre le fonctionnement, les horaires et les coûts de chaque marché", "Prendre en main TradingView et MetaTrader 5", "Passer du compte démo au compte réel avec méthode"],
    chapitres: fondamentaux(["introduction", "marches", "outils-du-trader"]),
  },
  {
    id: "risque-et-discipline",
    titre: "Risque, psychologie et protection",
    accroche: "Survivre aux séries de pertes, tenir un journal, éviter les biais et les arnaques.",
    rang: 3,
    gratuit: false,
    academie: "fondamentaux",
    competences: ["Mesurer drawdown, corrélation et risque de ruine", "Écrire et suivre un plan de trading", "Reconnaître ses biais et les arnaques courantes"],
    chapitres: fondamentaux(["gestion-du-risque", "psychologie", "se-proteger"]),
  },
  {
    id: "analyse-technique",
    titre: "Analyse technique",
    accroche: "Supports, tendances, structure, indicateurs, Fibonacci : leurs usages et leurs limites.",
    rang: 4,
    gratuit: false,
    academie: "fondamentaux",
    competences: ["Tracer supports, résistances et tendances", "Lire la structure de marché", "Utiliser moyennes mobiles, RSI, ATR et volume sans sur-interpréter"],
    chapitres: chapitresDe("fondamentaux", ["analyse-technique"]),
  },
  {
    id: "price-action",
    titre: "Price Action",
    accroche: "Lire le prix bougie par bougie : rejets, cassures, retests, compression et expansion.",
    rang: 5,
    gratuit: false,
    academie: "price-action",
    competences: ["Interpréter les configurations de bougies dans leur contexte", "Distinguer cassure, retest et faux breakout", "Construire une lecture de marché argumentée"],
    chapitres: chapitresDe("price-action", ["lecture-du-prix"]),
  },
  {
    id: "smart-money-concepts",
    titre: "Smart Money Concepts",
    accroche: "Structure, BOS, CHoCH, MSS, FVG et order blocks : l'école SMC, ses outils et ses critiques.",
    rang: 6,
    gratuit: false,
    academie: "smart-money-concepts",
    competences: ["Identifier swings, BOS, CHoCH et MSS sur un graphique", "Repérer FVG, order blocks et zones premium/discount", "Évaluer ce qui est établi et ce qui reste à tester"],
    chapitres: chapitresDe("smart-money-concepts", ["smc"]),
  },
  {
    id: "liquidite-ict",
    titre: "Liquidité et ICT",
    accroche: "Liquidité, sessions, prises de liquidité et modèles temporels de l'école ICT, avec leurs limites.",
    rang: 7,
    gratuit: false,
    academie: "liquidite-ict",
    competences: ["Situer les réserves de liquidité (BSL, SSL, plus hauts et plus bas)", "Lire sessions, killzones et opens", "Tester les modèles ICT au lieu de les croire"],
    chapitres: chapitresDe("liquidite-ict", ["ict"]),
  },
  {
    id: "modeles-et-methode",
    titre: "Modèles et méthode",
    accroche: "Huit modèles opérationnels traités en hypothèses, et la méthode pour les tester sans se tromper.",
    rang: 8,
    gratuit: false,
    academie: "modeles-et-methode",
    competences: ["Appliquer un modèle avec ses règles écrites", "Backtester sans biais", "Lire des statistiques de trading et passer au compte démo"],
    chapitres: chapitresDe("modeles-et-methode", ["modeles", "methode"]),
  },
];

const parChapitre = new Map(offre.flatMap((m) => m.chapitres.map((c) => [c, m] as const)));

/** Le module de l'offre auquel appartient un chapitre. */
export function moduleDuChapitre(slug: string) {
  return parChapitre.get(slug);
}

/** Un chapitre est-il librement consultable (module gratuit) ? */
export function chapitreGratuit(slug: string) {
  return parChapitre.get(slug)?.gratuit === true;
}
