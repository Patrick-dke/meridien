/** Une bougie : ouverture, plus haut, plus bas, clôture. */
export type Bougie = { o: number; h: number; l: number; c: number };

/** Couleurs sémantiques ; elles renvoient aux jetons CSS (palette daltonien comprise). */
export type Couleur = "bull" | "bear" | "brand" | "gold" | "info" | "ink" | "ok" | "warn" | "bad";

type AvecEtape = {
  /** Étape de la capsule à partir de laquelle l'élément apparaît (0 par défaut). */
  etape?: number;
};

export type Annotation = AvecEtape &
  (
    | {
        type: "niveau";
        prix: number;
        label?: string;
        couleur: Couleur;
        style?: "plein" | "pointille";
        /** Bougies de début et de fin ; toute la largeur par défaut. */
        de?: number;
        a?: number;
      }
    | {
        type: "zone";
        prixHaut: number;
        prixBas: number;
        de?: number;
        a?: number;
        label?: string;
        couleur: Couleur;
      }
    | { type: "fleche"; index: number; prix: number; sens: "haut" | "bas"; label?: string; couleur: Couleur }
    | { type: "repere"; index: number; label?: string; couleur: Couleur }
  );

export type SceneBougies = {
  kind: "bougies";
  description: string;
  bougies: Bougie[];
  decimales: number;
  annotations: Annotation[];
  /** Nombre de bougies visibles à chaque étape ; toutes par défaut. */
  revele?: number[];
  unite?: string;
};

export type SceneAnatomie = { kind: "anatomie"; description: string };

export type LigneCarnet = { prix: number; quantite: number };
export type SceneCarnet = {
  kind: "carnet";
  description: string;
  decimales: number;
  /** Ordres de vente, du plus bas au plus haut. */
  ventes: LigneCarnet[];
  /** Ordres d'achat, du plus haut au plus bas. */
  achats: LigneCarnet[];
  /** Ordre au marché qui vient consommer le carnet, pour l'illustration du slippage. */
  ordreMarche?: { sens: "achat" | "vente"; quantite: number; etape: number };
};

export type SceneUnitesDeTemps = {
  kind: "unites-de-temps";
  description: string;
  bougies: Bougie[];
  groupe: number;
  decimales: number;
  libelleCourt: string;
  libelleLong: string;
};

export type SceneLevier = {
  kind: "levier";
  description: string;
  capital: number;
  leviers: number[];
  variationPct: number;
};

export type SceneSeuil = { kind: "seuil-rentabilite"; description: string };

export type SceneDistribution = {
  kind: "series";
  description: string;
  /** Résultats en R, dans l'ordre. */
  resultats: number[];
};

export type SceneFigure =
  | SceneBougies
  | SceneAnatomie
  | SceneCarnet
  | SceneUnitesDeTemps
  | SceneLevier
  | SceneSeuil
  | SceneDistribution;
