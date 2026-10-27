import { depuisClotures, marcheAleatoire } from "@/lib/chartkit/outils";
import type { Bougie, SceneFigure } from "@/lib/chartkit/types";

/*
 * Scènes de figures des chapitres. Les données de prix sont synthétiques et écrites à la main
 * pour illustrer un mécanisme : elles ne décrivent pas un marché réel (mention affichée sous chaque figure).
 */

const allerRetour = depuisClotures(
  49.2,
  [49.4, 49.1, 49.6, 49.9, 50.0, 50.4, 50.2, 50.8, 51.3, 51.1, 51.7, 52.2, 52.0, 52.6, 53.1, 52.8, 53.3, 53.0, 52.7, 52.9],
  [0.25, 0.2, 0.3, 0.22],
  2,
);

const venteDecouvert = depuisClotures(
  61.0,
  [60.8, 61.2, 61.0, 60.5, 60.1, 60.4, 59.7, 59.2, 59.5, 58.8, 58.3, 58.6, 57.9, 57.5, 57.8, 58.1],
  [0.25, 0.2, 0.3, 0.22],
  2,
);

const longTerme = marcheAleatoire({ graine: 7, n: 60, depart: 40, vol: 0.9, derive: 0.12, decimales: 2 });
const fenetre = longTerme.slice(-6);

const avantAnnonce = marcheAleatoire({ graine: 11, n: 22, depart: 1.085, vol: 0.0004, decimales: 4 });
const apresAnnonce = marcheAleatoire({
  graine: 12,
  n: 18,
  depart: avantAnnonce[avantAnnonce.length - 1].c,
  vol: 0.0018,
  derive: -0.08,
  decimales: 4,
});

const lectureSerie: Bougie[] = [
  { o: 100.0, h: 100.6, l: 99.7, c: 100.4 },
  { o: 100.4, h: 100.9, l: 100.1, c: 100.2 },
  { o: 100.2, h: 100.5, l: 99.2, c: 100.3 },
  { o: 100.3, h: 101.8, l: 100.2, c: 101.7 },
  { o: 101.7, h: 102.0, l: 101.4, c: 101.8 },
  { o: 101.8, h: 101.9, l: 101.0, c: 101.1 },
  { o: 101.1, h: 101.4, l: 100.8, c: 101.12 },
  { o: 101.12, h: 101.6, l: 100.9, c: 101.5 },
  { o: 101.5, h: 102.3, l: 101.4, c: 101.6 },
  { o: 101.6, h: 101.7, l: 100.6, c: 100.7 },
  { o: 100.7, h: 101.0, l: 100.4, c: 100.9 },
  { o: 100.9, h: 101.3, l: 100.8, c: 101.2 },
];

const quartsDHeure: Bougie[] = [
  { o: 1.085, h: 1.0858, l: 1.0846, c: 1.0856 },
  { o: 1.0856, h: 1.0861, l: 1.0851, c: 1.0853 },
  { o: 1.0853, h: 1.0866, l: 1.0852, c: 1.0864 },
  { o: 1.0864, h: 1.0868, l: 1.0859, c: 1.0861 },
  { o: 1.0861, h: 1.0863, l: 1.0849, c: 1.0851 },
  { o: 1.0851, h: 1.0855, l: 1.0842, c: 1.0845 },
  { o: 1.0845, h: 1.0852, l: 1.084, c: 1.0849 },
  { o: 1.0849, h: 1.0851, l: 1.0838, c: 1.0841 },
];

const autourDe50 = marcheAleatoire({ graine: 21, n: 14, depart: 50, vol: 0.35, decimales: 2 });
const prixActuel = autourDe50[autourDe50.length - 1].c;
const arrondi2 = (x: number) => Math.round(x * 100) / 100;

// Plan d'achat : entrée 50,00, stop 47,80, objectif 54,40 (risque 2,20 €, gain visé 4,40 €, soit 2R).
const planAchat = depuisClotures(
  49.0,
  [49.3, 49.1, 49.6, 49.4, 49.8, 49.7, 49.9, 50.0, 49.6, 49.2, 49.5, 50.1, 50.7, 50.4, 51.2, 51.9, 51.6, 52.5, 53.2, 52.9, 53.8, 54.3],
  0.25,
  2,
);

const avantGap = depuisClotures(50.3, [50.0, 49.6, 49.1, 49.3, 48.8, 48.9, 48.5, 48.6], 0.25, 2);
const gap: Bougie[] = [
  ...avantGap,
  { o: 46.9, h: 47.3, l: 46.6, c: 47.1 },
  { o: 47.1, h: 47.6, l: 46.95, c: 47.4 },
  { o: 47.4, h: 47.8, l: 47.2, c: 47.6 },
  { o: 47.6, h: 48.0, l: 47.4, c: 47.9 },
];

const vingtPips = depuisClotures(
  1.0848,
  [1.085, 1.0853, 1.0851, 1.0856, 1.0859, 1.0857, 1.0862, 1.0866, 1.0864, 1.087],
  0.0003,
  4,
);

const avantEntree = depuisClotures(48.6, [48.9, 49.3, 49.1, 49.5, 49.8, 49.6, 50.1, 49.9, 50.2, 50.0], 0.2, 2);

export const scenes: Record<string, SceneFigure> = {
  "trading-aller-retour": {
    kind: "bougies",
    description:
      "Achat d'une action à 50,00 €, revente à 53,30 € quelques séances plus tard : le gain est l'écart entre les deux prix, soit 3,30 € par action.",
    bougies: allerRetour,
    decimales: 2,
    revele: [5, 5, 17, 20],
    annotations: [
      { type: "fleche", index: 4, prix: allerRetour[4].l, sens: "haut", label: "Achat", couleur: "bull", etape: 1 },
      { type: "fleche", index: 16, prix: allerRetour[16].h, sens: "bas", label: "Vente", couleur: "bear", etape: 2 },
      { type: "zone", prixHaut: 53.3, prixBas: 50.0, de: 4, a: 16, label: "+3,30 € par action", couleur: "bull", etape: 3 },
    ],
  },
  "trading-vente-decouvert": {
    kind: "bougies",
    description:
      "Position vendeuse : vente à 60,50 €, rachat à 57,50 €. Le prix a baissé de 3,00 €, c'est le gain par unité.",
    bougies: venteDecouvert,
    decimales: 2,
    revele: [4, 4, 14, 16],
    annotations: [
      { type: "fleche", index: 3, prix: venteDecouvert[3].h, sens: "bas", label: "1. Vente", couleur: "bear", etape: 1 },
      { type: "fleche", index: 13, prix: venteDecouvert[13].l, sens: "haut", label: "2. Rachat", couleur: "bull", etape: 2 },
      { type: "zone", prixHaut: 60.5, prixBas: 57.5, de: 3, a: 13, label: "+3,00 € par unité", couleur: "bull", etape: 3 },
    ],
  },
  horizons: {
    kind: "bougies",
    description:
      "Soixante séances d'un actif fictif. L'investisseur raisonne sur toute la période ; le trader travaille sur les dernières bougies.",
    bougies: longTerme,
    decimales: 2,
    annotations: [
      { type: "fleche", index: 2, prix: longTerme[2].l, sens: "haut", label: "Investisseur", couleur: "gold" },
      {
        type: "zone",
        prixHaut: Math.max(...fenetre.map((b) => b.h)),
        prixBas: Math.min(...fenetre.map((b) => b.l)),
        de: longTerme.length - 6,
        a: longTerme.length - 1,
        label: "Trader",
        couleur: "brand",
      },
    ],
  },
  "carnet-simple": {
    kind: "carnet",
    description:
      "Carnet d'ordres d'une action : les vendeurs proposent à partir de 50,02 €, les acheteurs à partir de 50,00 €. L'écart de 0,02 € est le spread.",
    decimales: 2,
    ventes: [
      { prix: 50.02, quantite: 300 },
      { prix: 50.03, quantite: 450 },
      { prix: 50.04, quantite: 200 },
      { prix: 50.05, quantite: 600 },
      { prix: 50.06, quantite: 350 },
    ],
    achats: [
      { prix: 50.0, quantite: 250 },
      { prix: 49.99, quantite: 500 },
      { prix: 49.98, quantite: 400 },
      { prix: 49.97, quantite: 300 },
      { prix: 49.96, quantite: 650 },
    ],
  },
  "carnet-mince": {
    kind: "carnet",
    description:
      "Un achat au marché de 1 000 actions dans un carnet peu fourni : il consomme quatre niveaux de prix et obtient un prix moyen de 50,03 €, au lieu des 50,02 € affichés.",
    decimales: 2,
    ventes: [
      { prix: 50.02, quantite: 300 },
      { prix: 50.03, quantite: 450 },
      { prix: 50.04, quantite: 200 },
      { prix: 50.05, quantite: 600 },
      { prix: 50.06, quantite: 350 },
    ],
    achats: [
      { prix: 50.0, quantite: 250 },
      { prix: 49.99, quantite: 500 },
      { prix: 49.98, quantite: 400 },
      { prix: 49.97, quantite: 300 },
      { prix: 49.96, quantite: 650 },
    ],
    ordreMarche: { sens: "achat", quantite: 1000, etape: 1 },
  },
  "carnet-profond": {
    kind: "carnet",
    description:
      "Le même achat de 1 000 actions dans un carnet très fourni : tout est exécuté au meilleur prix, 50,01 €, sans écart.",
    decimales: 2,
    ventes: [
      { prix: 50.01, quantite: 2500 },
      { prix: 50.02, quantite: 3200 },
      { prix: 50.03, quantite: 2800 },
      { prix: 50.04, quantite: 3500 },
      { prix: 50.05, quantite: 4000 },
    ],
    achats: [
      { prix: 50.0, quantite: 2700 },
      { prix: 49.99, quantite: 3100 },
      { prix: 49.98, quantite: 2900 },
      { prix: 49.97, quantite: 3600 },
      { prix: 49.96, quantite: 3800 },
    ],
    ordreMarche: { sens: "achat", quantite: 1000, etape: 1 },
  },
  "volatilite-annonce": {
    kind: "bougies",
    description:
      "Une paire de devises fictive : des bougies serrées, puis une annonce économique et des bougies quatre à cinq fois plus grandes.",
    bougies: [...avantAnnonce, ...apresAnnonce],
    decimales: 4,
    revele: [22, 40],
    annotations: [{ type: "repere", index: 22, label: "Annonce", couleur: "gold", etape: 1 }],
  },
  anatomie: {
    kind: "anatomie",
    description:
      "Une bougie haussière et une bougie baissière. Le corps relie l'ouverture et la clôture ; les mèches montrent le plus haut et le plus bas.",
  },
  "lecture-serie": {
    kind: "bougies",
    description:
      "Douze bougies : une longue mèche basse, une bougie au corps minuscule et une forte bougie baissière, repérées sur le graphique.",
    bougies: lectureSerie,
    decimales: 2,
    annotations: [
      { type: "repere", index: 2, label: "Mèche basse", couleur: "info", etape: 1 },
      { type: "repere", index: 6, label: "Petit corps", couleur: "gold", etape: 2 },
      { type: "repere", index: 9, label: "Forte baisse", couleur: "bear", etape: 3 },
    ],
  },
  "m15-vers-h1": {
    kind: "unites-de-temps",
    description:
      "Huit bougies de 15 minutes regroupées en deux bougies d'une heure : ouverture de la première, plus haut et plus bas du groupe, clôture de la dernière.",
    bougies: quartsDHeure,
    groupe: 4,
    decimales: 4,
    libelleCourt: "8 bougies de 15 minutes",
    libelleLong: "2 bougies d'une heure",
  },
  "ordres-achat": {
    kind: "bougies",
    description:
      "Deux façons d'acheter sans le faire tout de suite : un achat limite sous le prix actuel, un achat stop au-dessus.",
    bougies: autourDe50,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: prixActuel, label: "Prix actuel", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: arrondi2(prixActuel + 1.5), label: "Achat stop", couleur: "bull", style: "pointille", etape: 2 },
      { type: "niveau", prix: arrondi2(prixActuel - 1.5), label: "Achat limite", couleur: "bull", etape: 1 },
    ],
  },
  "ordres-vente": {
    kind: "bougies",
    description:
      "Deux façons de vendre sans le faire tout de suite : une vente limite au-dessus du prix actuel, une vente stop en dessous.",
    bougies: autourDe50,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: prixActuel, label: "Prix actuel", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: arrondi2(prixActuel + 1.5), label: "Vente limite", couleur: "bear", etape: 1 },
      { type: "niveau", prix: arrondi2(prixActuel - 1.5), label: "Vente stop", couleur: "bear", style: "pointille", etape: 2 },
    ],
  },
  "sl-tp-achat": {
    kind: "bougies",
    description:
      "Achat à 50,00 € avec un stop loss à 47,80 € et un take profit à 54,40 € : 2,20 € de risque pour 4,40 € visés. Le prix recule d'abord, puis atteint l'objectif.",
    bougies: planAchat,
    decimales: 2,
    revele: [8, 8, 8, 22],
    annotations: [
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille", de: 7 },
      { type: "zone", prixHaut: 50.0, prixBas: 47.8, de: 7, a: 21, couleur: "bear", etape: 1 },
      { type: "niveau", prix: 47.8, label: "Stop loss", couleur: "bear", de: 7, etape: 1 },
      { type: "zone", prixHaut: 54.4, prixBas: 50.0, de: 7, a: 21, couleur: "bull", etape: 2 },
      { type: "niveau", prix: 54.4, label: "Take profit", couleur: "bull", de: 7, etape: 2 },
    ],
  },
  "gap-stop": {
    kind: "bougies",
    description:
      "Un stop loss placé à 47,80 € alors que le marché rouvre directement à 46,90 € : le stop est exécuté au premier prix disponible, bien en dessous.",
    bougies: gap,
    decimales: 2,
    revele: [8, 9, 12],
    annotations: [
      { type: "niveau", prix: 47.8, label: "Stop loss", couleur: "bear", style: "pointille" },
      { type: "repere", index: 8, label: "Gap", couleur: "gold", etape: 1 },
      { type: "niveau", prix: 46.9, label: "Exécution", couleur: "warn", de: 8, a: 11, etape: 1 },
    ],
  },
  "mouvement-20-pips": {
    kind: "bougies",
    description: "EUR/USD passe de 1,0850 à 1,0870 : une hausse de 0,0020, soit 20 pips.",
    bougies: vingtPips,
    decimales: 4,
    annotations: [
      { type: "niveau", prix: 1.085, label: "Départ", couleur: "ink", style: "pointille" },
      { type: "zone", prixHaut: 1.087, prixBas: 1.085, de: 0, a: 9, label: "20 pips", couleur: "brand", etape: 1 },
      { type: "niveau", prix: 1.087, label: "Arrivée", couleur: "brand", etape: 1 },
    ],
  },
  "levier-comparaison": {
    kind: "levier",
    description:
      "Avec 1 000 € de capital, une baisse du prix de 1 % coûte 10 € sans levier, 100 € avec un levier de 1:10 et 300 € avec 1:30 si toute la position permise est ouverte.",
    capital: 1000,
    leviers: [1, 10, 30],
    variationPct: 1,
  },
  "position-stop-distance": {
    kind: "bougies",
    description:
      "Entrée prévue à 50,00 €, stop à 48,00 € : la distance de 2,00 € par action fixe, avec le risque accepté, le nombre d'actions.",
    bougies: avantEntree,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille" },
      { type: "zone", prixHaut: 50.0, prixBas: 48.0, de: 6, a: 9, label: "2,00 € par action", couleur: "bear", etape: 1 },
      { type: "niveau", prix: 48.0, label: "Stop", couleur: "bear", etape: 1 },
    ],
  },
  "seuil-rentabilite": {
    kind: "seuil-rentabilite",
    description:
      "Taux de réussite minimal pour ne pas perdre, sans frais : 50 % avec un ratio de 1, 33,3 % avec 2, 25 % avec 3.",
  },
  "series-resultats": {
    kind: "series",
    description:
      "Vingt trades d'une méthode qui gagne 2R ou perd 1R avec 35 % de réussite : légèrement gagnante au total, mais avec six pertes d'affilée.",
    resultats: [2, -1, -1, 2, -1, -1, -1, -1, 2, 2, -1, -1, -1, -1, -1, -1, 2, 2, -1, 2],
  },
};

/**
 * Scènes des chapitres payants : elles arrivent avec le contenu, servi par la base à qui a un droit d'accès,
 * et rejoignent ce registre dans le navigateur. Une scène publique n'est jamais remplacée.
 */
export function ajouterScenes(extra: Record<string, SceneFigure>) {
  for (const [id, s] of Object.entries(extra)) if (!(id in scenes)) scenes[id] = s;
}
