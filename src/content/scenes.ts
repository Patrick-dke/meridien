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

/*
 * Premiers pas, version 2 : figures de cours (pp-…), graphiques de questions (pp-q-…) et d'exercices (pp-e-…).
 * Une scène de question ne montre jamais la réponse : ni annotation révélatrice, ni description qui la donne.
 */

/** Remplace quelques prix d'une série : une mèche plus longue, un extrême précis. */
const retouche = (bougies: Bougie[], modifs: Record<number, Partial<Bougie>>): Bougie[] => bougies.map((b, i) => ({ ...b, ...modifs[i] }));
const repete = (valeur: number, n: number) => Array.from({ length: n }, () => valeur);

// Chapitre 1 : gain, perte, position vendeuse.
const ppAchatPerte = depuisClotures(49.4, [49.6, 49.3, 49.7, 49.8, 50.0, 49.7, 49.9, 49.4, 49.0, 49.2, 48.6, 48.1, 48.4, 47.8, 47.3, 47.5, 47.0, 47.2], [0.25, 0.2, 0.3, 0.22], 2);
const ppVentePerte = depuisClotures(60.0, [60.2, 59.9, 60.3, 60.5, 60.2, 60.6, 60.9, 60.7, 61.2, 61.0, 61.5, 61.8, 61.6, 62.0, 61.8], [0.25, 0.2, 0.3, 0.22], 2);
const ppQVenteRachat = retouche(depuisClotures(61.0, [60.8, 61.1, 60.9, 60.5, 60.2, 59.8, 60.0, 59.4, 59.0, 59.3, 58.6, 58.1, 58.5, 58.9, 58.7, 59.2, 59.0, 59.5], 0.2, 2), { 11: { l: 57.7 } });
const ppQAchatVente = depuisClotures(49.5, [49.7, 49.6, 50.0, 49.8, 50.2, 49.9, 49.5, 49.6, 49.1, 48.8, 49.0, 48.5, 48.7], 0.2, 2);
const ppQVenteGain = depuisClotures(60.2, [60.4, 60.3, 60.5, 60.1, 59.8, 60.0, 59.5, 59.2, 59.4, 58.9, 59.0, 59.2], 0.2, 2);
const ppQVentePerdante = depuisClotures(60.2, [60.4, 60.3, 60.5, 60.8, 60.6, 61.0, 61.3, 61.1, 61.5, 61.4, 61.6, 61.3], 0.2, 2);
const ppQPetitGain = depuisClotures(49.9, [50.05, 49.95, 50.0, 50.1, 50.05, 50.2, 50.15, 50.25, 50.3, 50.2, 50.25, 50.15], 0.06, 2);

// Chapitre 2 : horizon de l'investisseur, sorties du trader.
const ppHorizonLong = retouche(
  depuisClotures(
    40.0,
    [40.8, 41.5, 42.3, 41.6, 42.8, 43.5, 42.9, 41.2, 39.4, 37.6, 36.1, 34.0, 32.5, 31.2, 30.6, 31.8, 33.0, 32.4, 34.2, 35.8, 37.1, 36.5, 38.4, 40.1, 41.7, 41.0, 42.9, 44.6, 45.3, 44.8, 46.5, 48.0, 47.4, 49.2, 50.6],
    [0.6, 0.5, 0.7, 0.55],
    2,
  ),
  { 14: { l: 30.0 } },
);
const ppDeuxDemarches = depuisClotures(40.6, [40.3, 40.6, 40.0, 39.6, 39.9, 39.2, 38.7, 38.9, 38.3, 37.6, 36.8, 37.1, 36.2, 35.5, 35.0, 35.4, 35.1], 0.25, 2);
const ppPiege = depuisClotures(40.5, [40.2, 40.4, 40.0, 39.5, 39.8, 39.1, 38.6, 38.3, 37.5, 37.0, 36.2, 36.6, 35.4, 34.8, 35.1, 33.9, 33.2, 32.6, 32.9, 32.0], 0.25, 2);
const ppQStopTrader = retouche(depuisClotures(40.5, [40.2, 40.4, 40.0, 39.6, 39.9, 39.3, 38.9, 39.1, 38.5, 38.7, 38.3, 39.0, 39.4, 39.2, 39.8, 40.3], 0.25, 2), { 10: { l: 37.8 } });

// Chapitre 3 : carnets d'ordres.
const ventesSimples = [
  { prix: 50.02, quantite: 300 },
  { prix: 50.03, quantite: 450 },
  { prix: 50.04, quantite: 200 },
  { prix: 50.05, quantite: 600 },
  { prix: 50.06, quantite: 350 },
];
const achatsSimples = [
  { prix: 50.0, quantite: 250 },
  { prix: 49.99, quantite: 500 },
  { prix: 49.98, quantite: 400 },
  { prix: 49.97, quantite: 300 },
  { prix: 49.96, quantite: 650 },
];
const ppQPression = retouche(depuisClotures(50.0, [50.2, 50.1, 50.4, 50.3, 50.6, 50.5, 49.6, 49.8, 49.7, 50.0, 49.5, 49.8], 0.15, 2), { 3: { l: 49.3 } });

// Chapitre 4 : banque centrale, couverture.
const ppDecisionTaux = depuisClotures(
  1.085,
  [1.0852, 1.0849, 1.0853, 1.0851, 1.0854, 1.085, 1.0852, 1.0855, 1.0853, 1.0851, 1.0854, 1.0852, 1.0798, 1.0812, 1.079, 1.0804, 1.0786, 1.0795],
  [...repete(0.0002, 12), 0.0012, ...repete(0.001, 5)],
  4,
);
const ppCouverture = depuisClotures(1.085, [1.0832, 1.0861, 1.0815, 1.079, 1.0808, 1.0762, 1.0735, 1.0751, 1.0702, 1.0668, 1.069, 1.0641, 1.06], 0.002, 4);
const ppQAnnonceTaux = depuisClotures(
  1.0919,
  [1.0921, 1.0918, 1.0923, 1.092, 1.0924, 1.0922, 1.0919, 1.0923, 1.0921, 1.0925, 1.0978, 1.0961, 1.0985, 1.097, 1.099, 1.0981],
  [...repete(0.0002, 10), 0.001, ...repete(0.0008, 5)],
  4,
);
const ppQCouverture = retouche(depuisClotures(1.085, [1.0868, 1.0841, 1.0879, 1.0902, 1.0885, 1.0921, 1.0944, 1.093, 1.0962, 1.0951, 1.0978, 1.0969, 1.1], 0.002, 4), { 12: { h: 1.1 } });

// Chapitre 5 : volatilité et stop.
const ppStopVolatilite: Bougie[] = [
  { o: 1.085, h: 1.085, l: 1.0846, c: 1.0847 },
  { o: 1.0847, h: 1.0849, l: 1.0845, c: 1.0848 },
  { o: 1.0848, h: 1.0849, l: 1.0845, c: 1.0846 },
  { o: 1.0846, h: 1.0849, l: 1.0845, c: 1.0848 },
  { o: 1.0848, h: 1.0849, l: 1.0846, c: 1.0847 },
  { o: 1.0847, h: 1.0849, l: 1.0845, c: 1.0848 },
  { o: 1.0848, h: 1.0849, l: 1.0846, c: 1.0846 },
  { o: 1.0846, h: 1.0849, l: 1.0845, c: 1.0848 },
  { o: 1.0848, h: 1.0849, l: 1.0845, c: 1.0847 },
  { o: 1.0847, h: 1.0849, l: 1.0846, c: 1.0849 },
  { o: 1.0849, h: 1.0849, l: 1.0845, c: 1.0846 },
  { o: 1.0846, h: 1.0849, l: 1.0845, c: 1.0848 },
  { o: 1.0848, h: 1.0851, l: 1.0837, c: 1.0839 },
  { o: 1.0839, h: 1.0856, l: 1.0837, c: 1.0853 },
  { o: 1.0853, h: 1.0855, l: 1.0838, c: 1.0841 },
  { o: 1.0841, h: 1.086, l: 1.0839, c: 1.0857 },
  { o: 1.0857, h: 1.0858, l: 1.0834, c: 1.0844 },
  { o: 1.0844, h: 1.0862, l: 1.0842, c: 1.086 },
  { o: 1.086, h: 1.0863, l: 1.0848, c: 1.0851 },
  { o: 1.0851, h: 1.0866, l: 1.0849, c: 1.0864 },
];
const ppQStopSerre = retouche(
  depuisClotures(1.0846, [1.0848, 1.0846, 1.0849, 1.085, 1.0848, 1.0851, 1.0849, 1.0852, 1.085, 1.0842, 1.0855, 1.0849, 1.086, 1.0856, 1.0864], [...repete(0.0001, 9), ...repete(0.0003, 6)], 4),
  { 9: { l: 1.0837 }, 10: { l: 1.0841 } },
);

// Chapitre 6 : lire une bougie.
const ppLigne = retouche(depuisClotures(50.0, [50.3, 50.1, 50.5, 50.4, 50.7, 50.6, 50.8, 50.7, 51.0, 50.9, 51.2, 51.1, 51.4, 51.3], 0.15, 2), { 6: { h: 52.2 }, 10: { l: 49.9 } });
const ppBougieChiffres = retouche(depuisClotures(100.6, [100.8, 100.5, 100.9, 100.7, 100.4, 100.3, 100.1, 100.2, 100.3, 100.1, 100.0, 100.2], 0.15, 2), { 8: { h: 100.5, l: 99.2 } });
const ppQBaissiere = depuisClotures(20.0, [20.2, 20.4, 20.5, 20.8, 21.0, 20.6, 20.9, 21.1, 21.2, 21.5, 21.6, 21.9], [0.1, 0.15, 0.12], 2);
const ppQMecheHaute = retouche(depuisClotures(30.0, [30.3, 30.1, 30.6, 30.4, 30.2, 30.7, 30.5, 30.9, 30.8, 31.1, 30.9, 31.2], 0.1, 2), { 2: { h: 30.9 }, 7: { h: 31.6 }, 9: { l: 30.2 } });
const ppQQuatrePrix: Bougie[] = [
  { o: 40.3, h: 40.5, l: 40.0, c: 40.1 },
  { o: 40.1, h: 40.4, l: 39.9, c: 40.3 },
  { o: 40.3, h: 40.5, l: 40.1, c: 40.2 },
  { o: 40.2, h: 40.35, l: 39.95, c: 40.05 },
  { o: 40.05, h: 40.25, l: 39.85, c: 40.0 },
  { o: 40.0, h: 41.6, l: 39.3, c: 41.0 },
  { o: 41.0, h: 41.3, l: 40.8, c: 41.1 },
];
const ppQRejetBase = depuisClotures(45.0, [45.3, 45.1, 45.4, 45.2, 45.5, 45.3, 45.6, 45.4, 45.7, 45.5, 45.8], 0.12, 2);

// Chapitre 7 : unités de temps.
const ppH1VersH4 = marcheAleatoire({ graine: 31, n: 24, depart: 1.085, vol: 0.0006, decimales: 4 });
const ppEchelles = depuisClotures(
  40.0,
  [40.4, 40.9, 40.6, 41.3, 41.9, 41.5, 42.2, 42.8, 42.4, 43.1, 43.7, 43.3, 44.0, 44.6, 44.2, 45.0, 45.5, 45.1, 45.8, 46.4, 46.0, 46.7, 47.2, 46.8, 46.3, 46.5, 45.9, 45.4, 45.6, 45.0],
  [0.3, 0.25, 0.35],
  2,
);
const ppQM15Heures: Bougie[] = [
  { o: 1.092, h: 1.0927, l: 1.0916, c: 1.0925 },
  { o: 1.0925, h: 1.0938, l: 1.0922, c: 1.0931 },
  { o: 1.0931, h: 1.0931, l: 1.0921, c: 1.0924 },
  { o: 1.0924, h: 1.0929, l: 1.0918, c: 1.0927 },
  { o: 1.0927, h: 1.093, l: 1.0915, c: 1.0918 },
  { o: 1.0918, h: 1.0922, l: 1.0909, c: 1.0912 },
  { o: 1.0912, h: 1.092, l: 1.091, c: 1.0917 },
  { o: 1.0917, h: 1.0919, l: 1.0905, c: 1.0908 },
  { o: 1.0908, h: 1.0914, l: 1.0903, c: 1.0912 },
  { o: 1.0912, h: 1.0919, l: 1.0909, c: 1.0916 },
  { o: 1.0916, h: 1.0921, l: 1.0911, c: 1.0913 },
  { o: 1.0913, h: 1.0917, l: 1.0906, c: 1.0915 },
];
const separateursHeures = [3.5, 7.5].map((index) => ({
  type: "ligne" as const,
  de: { index, prix: 1.09 },
  a: { index, prix: 1.0942 },
  couleur: "ink" as const,
  style: "pointille" as const,
}));

// Chapitre 8 : ordres limite et stop.
const ppAchatLimite = retouche(depuisClotures(50.2, [50.1, 50.3, 50.0, 49.8, 49.9, 49.5, 49.6, 49.2, 49.3, 49.7, 50.1, 50.4, 50.2, 50.6], 0.15, 2), { 8: { l: 48.9 }, 9: { l: 49.2 } });
const ppAchatStopGap: Bougie[] = [
  ...depuisClotures(50.2, [50.3, 50.2, 50.5, 50.4, 50.6, 50.5, 50.7], 0.12, 2),
  { o: 51.4, h: 51.7, l: 51.3, c: 51.6 },
  { o: 51.6, h: 51.9, l: 51.45, c: 51.8 },
  { o: 51.8, h: 52.0, l: 51.6, c: 51.7 },
  { o: 51.7, h: 51.95, l: 51.55, c: 51.85 },
  { o: 51.85, h: 52.1, l: 51.7, c: 52.0 },
];
const ppTroisOrdres = depuisClotures(49.9, [50.0, 50.2, 49.8, 50.1, 50.5, 50.3, 50.8, 51.0, 50.9, 51.3, 51.6, 51.4, 51.9, 52.2], 0.15, 2);
const ppNiveaux = retouche(depuisClotures(49.2, [49.4, 49.3, 49.6, 49.5, 49.4, 49.7, 49.6, 49.8, 49.75, 49.9, 50.0, 50.1, 50.2, 50.4], 0.15, 2), { 13: { h: 50.4 } });
const ppQLimiteDessus = retouche(depuisClotures(48.8, [49.0, 48.9, 49.2, 49.1, 49.4, 49.3, 49.6, 49.7, 49.8, 50.0], 0.12, 2), { 9: { h: 50.0 } });
const ppEAchatStop = depuisClotures(49.9, [50.0, 50.2, 49.8, 50.1, 50.5, 50.3, 50.8, 51.0, 50.9, 51.3, 51.7, 52.0, 52.3, 52.6], 0.15, 2);
const ppQLimiteExecution = retouche(depuisClotures(25.3, [25.2, 25.4, 25.1, 25.0, 25.2, 24.8, 24.9, 24.7, 24.9, 25.1, 24.95, 25.3], 0.12, 2), { 7: { l: 24.45 } });

// Chapitre 9 : placer stop et objectif.
const ppSlTpVente = retouche(depuisClotures(60.1, [60.3, 60.2, 60.5, 60.9, 61.2, 60.8, 60.4, 60.5, 59.9, 59.5, 59.8, 59.1, 58.7, 58.9, 58.3], 0.2, 2), { 14: { l: 58.05 } });
const ppSupport = retouche(depuisClotures(49.5, [49.0, 48.6, 48.4, 48.9, 49.4, 49.0, 48.5, 48.8, 49.3, 48.7, 49.2, 49.6, 49.7, 49.85, 50.0], 0.2, 2), {
  2: { l: 48.1 },
  6: { l: 48.15 },
  9: { l: 48.2 },
  13: { h: 49.95, l: 49.65 },
  14: { h: 50.0, l: 49.75 },
});
const ppStopSerre = depuisClotures(49.6, [49.9, 49.7, 50.1, 49.6, 49.3, 49.7, 50.0, 49.8, 49.75, 50.2, 50.6, 50.4, 51.0, 51.3, 51.6], 0.2, 2);
const ppQStopTouche = retouche(depuisClotures(49.6, [49.8, 50.0, 49.7, 49.9, 49.4, 49.6, 49.1, 49.3, 49.1, 49.4, 49.8, 50.3, 50.1, 50.6], 0.2, 2), {
  6: { l: 49.0 },
  7: { l: 49.0 },
  8: { l: 48.7 },
  9: { l: 49.05 },
});

// Chapitre 10 : coûts.
const ppSpreadDepart = depuisClotures(1.0848, [1.0849, 1.0851, 1.0849, 1.085, 1.0849, 1.0851, 1.085, 1.0851, 1.0853, 1.0855, 1.0854, 1.0857], 0.0001, 4);
const ppCoutsObjectif = retouche(depuisClotures(1.0844, [1.0846, 1.0845, 1.0848, 1.0847, 1.085, 1.0852, 1.0851, 1.0854, 1.0853, 1.0856, 1.0858, 1.0857, 1.086], 0.00015, 5), {
  4: { h: 1.085 },
  12: { h: 1.086 },
});
const ppQRetourZero = retouche(depuisClotures(1.0849, [1.085, 1.0848, 1.0851, 1.0849, 1.0851, 1.085, 1.0853, 1.0851, 1.0849, 1.085, 1.0848, 1.0851], 0.0002, 4), { 11: { h: 1.0852 } });
const ppQObjectif = retouche(depuisClotures(1.0844, [1.0846, 1.0845, 1.0848, 1.0847, 1.085, 1.0849, 1.0851, 1.085, 1.0852, 1.0851, 1.0853, 1.0852], 0.00015, 5), { 4: { h: 1.085 } });
const ppQGapStop: Bougie[] = [
  ...depuisClotures(1.085, [1.0846, 1.0841, 1.0844, 1.0838, 1.0835, 1.0839, 1.0832, 1.083], 0.0003, 4),
  { o: 1.0805, h: 1.0812, l: 1.0799, c: 1.0809 },
  { o: 1.0809, h: 1.0815, l: 1.0803, c: 1.0811 },
  { o: 1.0811, h: 1.0818, l: 1.0806, c: 1.0815 },
  { o: 1.0815, h: 1.0819, l: 1.0808, c: 1.0812 },
];

// Chapitre 11 : pips et points.
const ppUsdJpy = retouche(depuisClotures(150.18, [150.2, 150.26, 150.23, 150.34, 150.31, 150.42, 150.48, 150.45, 150.56, 150.53, 150.6, 150.65], 0.03, 2), { 11: { h: 150.65 } });
const ppPipettes = retouche(depuisClotures(1.08498, [1.08503, 1.08511, 1.08507, 1.08518, 1.08526, 1.08521, 1.08534, 1.08542, 1.08538, 1.08547, 1.08544, 1.08553], 0.00004, 5), { 11: { h: 1.08553 } });
const ppIndice = retouche(depuisClotures(17990, [18000, 18012, 18006, 18021, 18015, 18030, 18038, 18033, 18046, 18041, 18044, 18050], 4, 0), { 11: { h: 18050 } });
const ppQCorps = depuisClotures(1.09, [1.0905, 1.0913, 1.0907, 1.0918, 1.0911, 1.0926, 1.0938, 1.0929, 1.0947, 1.0943, 1.0953, 1.0966], 0.0003, 4);
const ppQEurJpy = retouche(depuisClotures(161.75, [161.7, 161.77, 161.84, 161.79, 161.96, 162.01, 161.94, 162.08, 162.19, 162.15, 162.27, 162.45], 0.04, 2), { 11: { h: 162.45 } });
const ppQPipsA = retouche(depuisClotures(1.0848, [1.085, 1.0856, 1.0853, 1.0861, 1.0858, 1.0866, 1.0863, 1.0871, 1.0869, 1.0876, 1.0874, 1.088], 0.0003, 4), { 11: { h: 1.088 } });
const ppQPipsB = retouche(depuisClotures(150.18, [150.2, 150.24, 150.22, 150.28, 150.26, 150.31, 150.29, 150.35, 150.33, 150.4, 150.38, 150.45], 0.03, 2), { 11: { h: 150.45 } });
const ppQPertePips = retouche(depuisClotures(1.0847, [1.085, 1.0854, 1.0852, 1.0858, 1.0862, 1.0859, 1.0865, 1.0869, 1.0866, 1.0872, 1.087, 1.0875], 0.0003, 4), { 11: { h: 1.0875 } });

// Chapitre 12 : fermeture forcée.
const ppStopOut = retouche(
  depuisClotures(20040, [20000, 19960, 19985, 19910, 19870, 19905, 19820, 19760, 19790, 19700, 19640, 19600, 19560, 19520, 19560, 19620, 19700], 15, 0),
  { 13: { l: 19480 } },
);
const ppQStopOut = retouche(depuisClotures(20030, [20000, 19950, 19980, 19890, 19840, 19870, 19760, 19700, 19730, 19620, 19580, 19650, 19720, 19690, 19800], 15, 0), { 10: { l: 19470 } });
const ppQLevierBaisse = retouche(depuisClotures(20020, [20000, 19940, 19975, 19890, 19850, 19880, 19790, 19590, 19570, 19550, 19560, 19600], 15, 0), {
  8: { h: 19600 },
  11: { h: 19600 },
});

// Chapitre 13 : taille de position.
const ppStop25Pips = retouche(depuisClotures(1.0838, [1.0841, 1.0837, 1.0836, 1.0831, 1.0838, 1.0842, 1.0839, 1.0845, 1.0843, 1.0847, 1.0846, 1.085], 0.0002, 4), { 11: { h: 1.085 } });
const ppDeuxStops = retouche(depuisClotures(47.2, [46.8, 46.2, 45.6, 46.3, 47.1, 46.8, 47.6, 48.4, 49.5, 49.3, 49.8, 50.0], 0.2, 2), { 11: { h: 50.0 } });
const ppQCreuxStop = retouche(depuisClotures(51.0, [50.6, 50.2, 50.5, 49.9, 49.4, 49.8, 50.3, 50.0, 49.7, 50.2, 50.6, 50.9], 0.2, 2), { 5: { l: 49.3 } });
const ppQTailleFcfa = retouche(depuisClotures(1975, [1980, 1972, 1985, 1978, 1990, 1984, 1995, 1988, 1992, 1990, 1994, 2000], 4, 0), { 11: { h: 2000 } });
const ppQTailleForex = retouche(depuisClotures(1.0838, [1.0842, 1.0837, 1.0844, 1.0841, 1.0846, 1.0844, 1.0848, 1.0845, 1.0847, 1.0849, 1.0847, 1.085], 0.0001, 4), { 11: { h: 1.085 } });

// Chapitre 14 : unité R et objectifs.
const ppUnitesR = depuisClotures(48.3, [48.4, 48.2, 48.7, 48.5, 49.0, 48.8, 49.3, 50.0, 50.4, 50.9, 51.3, 51.1, 51.8, 51.7], 0.15, 2);
const ppQObjectif2R = retouche(depuisClotures(49.6, [50.0, 50.6, 50.3, 51.1, 51.8, 51.5, 52.4, 52.1, 52.9, 53.5, 53.2, 53.8, 53.4, 53.0, 53.6], 0.2, 2), {
  11: { h: 54.15 },
  12: { h: 53.9 },
});

const scenesPremiersPas: Record<string, SceneFigure> = {
  // ── Chapitre 1 ──
  "pp-achat-perte": {
    kind: "bougies",
    description: "Achat d'une action à 50,00 €, revente à 47,00 € après une baisse : la perte est de 3,00 € par action.",
    bougies: ppAchatPerte,
    decimales: 2,
    revele: [5, 5, 17, 18],
    annotations: [
      { type: "fleche", index: 4, prix: ppAchatPerte[4].l, sens: "haut", label: "Achat", couleur: "bull", etape: 1 },
      { type: "fleche", index: 16, prix: ppAchatPerte[16].h, sens: "bas", label: "Vente", couleur: "bear", etape: 2 },
      { type: "zone", prixHaut: 50.0, prixBas: 47.0, de: 4, a: 16, couleur: "bear", etape: 3 },
      { type: "etiquette", index: 8, prix: 47.0, texte: "−3,00 € par action", position: "bas", couleur: "bear", etape: 3 },
    ],
  },
  "pp-vente-perte": {
    kind: "bougies",
    description: "Position vendeuse : vente à 60,50 €, rachat à 62,00 € après une hausse. La perte est de 1,50 € par unité.",
    bougies: ppVentePerte,
    decimales: 2,
    revele: [4, 4, 14, 15],
    annotations: [
      { type: "fleche", index: 3, prix: ppVentePerte[3].h, sens: "bas", label: "1. Vente", couleur: "bear", etape: 1 },
      { type: "fleche", index: 13, prix: ppVentePerte[13].l, sens: "haut", label: "2. Rachat", couleur: "bull", etape: 2 },
      { type: "zone", prixHaut: 62.0, prixBas: 60.5, de: 3, a: 13, label: "−1,50 € par unité", couleur: "bear", etape: 3 },
    ],
  },
  "pp-q-vente-rachat": {
    kind: "bougies",
    description: "Position vendeuse ouverte à 60,50 € à la bougie marquée « Vente » ; le prix évolue ensuite pendant quatorze séances.",
    bougies: ppQVenteRachat,
    decimales: 2,
    annotations: [{ type: "fleche", index: 3, prix: ppQVenteRachat[3].h, sens: "bas", label: "Vente", couleur: "bear" }],
  },
  "pp-q-achat-vente": {
    kind: "bougies",
    description: "Achat d'actions à 50,00 €, puis revente à 48,50 €.",
    bougies: ppQAchatVente,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.0, label: "Prix d'achat", couleur: "ink", style: "pointille" },
      { type: "fleche", index: 2, prix: ppQAchatVente[2].l, sens: "haut", couleur: "bull" },
      { type: "fleche", index: 11, prix: ppQAchatVente[11].h, sens: "bas", couleur: "bear" },
      { type: "etiquette", index: 11, prix: ppQAchatVente[11].l, texte: "Revente à 48,50", position: "bas", couleur: "bear" },
    ],
  },
  "pp-q-vente-a": {
    kind: "bougies",
    description: "Graphique A : vente à 60,50 €, puis rachat huit séances plus tard.",
    bougies: ppQVenteGain,
    decimales: 2,
    annotations: [
      { type: "etiquette", index: 2, prix: ppQVenteGain[2].h, texte: "Vente", position: "haut", couleur: "bear" },
      { type: "etiquette", index: 10, prix: ppQVenteGain[10].l, texte: "Rachat", position: "bas", couleur: "bull" },
    ],
  },
  "pp-q-vente-b": {
    kind: "bougies",
    description: "Graphique B : vente à 60,50 €, puis rachat huit séances plus tard.",
    bougies: ppQVentePerdante,
    decimales: 2,
    annotations: [
      { type: "etiquette", index: 2, prix: ppQVentePerdante[2].h, texte: "Vente", position: "haut", couleur: "bear" },
      { type: "etiquette", index: 10, prix: ppQVentePerdante[10].l, texte: "Rachat", position: "bas", couleur: "bull" },
    ],
  },
  "pp-q-petit-gain": {
    kind: "bougies",
    description: "Achat à 50,00 €, revente à 50,30 €.",
    bougies: ppQPetitGain,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.0, label: "Prix d'achat", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 50.3, couleur: "bull", style: "pointille" },
      { type: "fleche", index: 2, prix: ppQPetitGain[2].l, sens: "haut", couleur: "bull" },
      { type: "fleche", index: 8, prix: ppQPetitGain[8].h, sens: "bas", couleur: "bear" },
    ],
  },

  // ── Chapitre 2 ──
  "pp-horizon-long": {
    kind: "bougies",
    description:
      "Une action achetée 40,00 € qui tombe jusqu'à 30,00 € en cours de route, puis remonte au-dessus de 50,00 € : l'investisseur a traversé la baisse sans vendre.",
    bougies: ppHorizonLong,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 40.0, label: "Prix d'achat", couleur: "ink", style: "pointille", a: 22 },
      { type: "fleche", index: 0, prix: ppHorizonLong[0].l, sens: "haut", couleur: "gold" },
      { type: "zone", prixHaut: 40.0, prixBas: 30.0, de: 8, a: 22, couleur: "bear", etape: 1 },
      { type: "etiquette", index: 14, prix: 30.0, texte: "Plus bas : 30,00 €", position: "bas", couleur: "bear", etape: 1 },
    ],
  },
  "pp-deux-demarches": {
    kind: "bougies",
    description:
      "Une action achetée 40,00 € par deux personnes. Le trader a prévu de sortir à 38,00 € ou à 44,00 € : le prix baisse, son stop est touché et il sort. L'investisseuse garde son action pendant que le prix descend vers 35,00 €.",
    bougies: ppDeuxDemarches,
    decimales: 2,
    revele: [9, 17],
    annotations: [
      { type: "niveau", prix: 40.0, label: "Achat", couleur: "ink", style: "pointille", de: 2 },
      { type: "niveau", prix: 44.0, label: "Objectif du trader", couleur: "bull", style: "pointille", de: 2 },
      { type: "niveau", prix: 38.0, label: "Stop du trader", couleur: "bear", de: 2 },
      { type: "repere", index: 9, label: "Sortie du trader", couleur: "bear", etape: 1 },
      { type: "etiquette", index: 14, prix: ppDeuxDemarches[14].l, texte: "Elle garde", position: "bas", couleur: "gold", etape: 1 },
    ],
  },
  "pp-piege-long-terme": {
    kind: "bougies",
    description:
      "Un trader achète à 40,00 € avec un stop prévu à 38,00 €. Quand le prix l'atteint, il ne vend pas et garde « pour le long terme » : le prix descend jusqu'à 32,00 € et la perte passe de 2,00 € à 8,00 € par action.",
    bougies: ppPiege,
    decimales: 2,
    revele: [8, 9, 20],
    annotations: [
      { type: "niveau", prix: 40.0, label: "Achat", couleur: "ink", style: "pointille", de: 2 },
      { type: "niveau", prix: 38.0, label: "Stop prévu", couleur: "bear", style: "pointille", de: 2 },
      { type: "zone", prixHaut: 40.0, prixBas: 38.0, de: 2, a: 8, couleur: "bear", etape: 1 },
      { type: "etiquette", index: 3.5, prix: 38.0, texte: "Perte prévue : 2,00 €", position: "bas", couleur: "bear", etape: 1 },
      { type: "repere", index: 8, label: "Stop ignoré", couleur: "warn", etape: 1 },
      { type: "zone", prixHaut: 38.0, prixBas: 32.0, de: 8, a: 19, couleur: "bad", etape: 2 },
      { type: "etiquette", index: 15, prix: 38.0, texte: "Perte en plus : 6,00 €", position: "bas", couleur: "bad", etape: 2 },
    ],
  },
  "pp-q-stop-trader": {
    kind: "bougies",
    description: "Un trader achète à 40,00 € avec un stop à 38,00 € ; le prix évolue pendant seize séances.",
    bougies: ppQStopTrader,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 40.0, label: "Achat", couleur: "ink", style: "pointille", de: 2, a: 14 },
      { type: "niveau", prix: 38.0, label: "Stop", couleur: "bear", de: 2 },
    ],
  },
  "pp-q-respect-a": {
    kind: "bougies",
    description: "Graphique A : achat à 40,00 €, stop prévu à 38,00 € ; quand le prix atteint 38,00 €, la position est vendue.",
    bougies: ppPiege,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 40.0, label: "Achat", couleur: "ink", style: "pointille", de: 2 },
      { type: "niveau", prix: 38.0, label: "Stop prévu", couleur: "bear", style: "pointille", de: 2 },
      { type: "fleche", index: 8, prix: ppPiege[8].h, sens: "bas", label: "Vente à 38,00", couleur: "bear" },
    ],
  },
  "pp-q-respect-b": {
    kind: "bougies",
    description: "Graphique B : achat à 40,00 €, stop prévu à 38,00 € ; le prix passe sous 38,00 € et la position reste ouverte.",
    bougies: ppPiege,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 40.0, label: "Achat", couleur: "ink", style: "pointille", de: 2 },
      { type: "niveau", prix: 38.0, label: "Stop prévu", couleur: "bear", style: "pointille", de: 2 },
      { type: "etiquette", index: 15, prix: 38.0, texte: "Toujours ouverte", position: "bas", couleur: "warn" },
    ],
  },

  // ── Chapitre 3 ──
  "pp-carnet-fcfa": {
    kind: "carnet",
    description:
      "Carnet d'ordres d'une action cotée en FCFA : le meilleur vendeur demande 2 505 FCFA pour 120 actions, le meilleur acheteur propose 2 500 FCFA pour 150 actions. Le spread est de 5 FCFA.",
    decimales: 0,
    ventes: [
      { prix: 2505, quantite: 120 },
      { prix: 2510, quantite: 300 },
      { prix: 2515, quantite: 80 },
      { prix: 2520, quantite: 450 },
      { prix: 2530, quantite: 200 },
    ],
    achats: [
      { prix: 2500, quantite: 150 },
      { prix: 2495, quantite: 260 },
      { prix: 2490, quantite: 400 },
      { prix: 2485, quantite: 90 },
      { prix: 2480, quantite: 300 },
    ],
  },
  "pp-carnet-vente-marche": {
    kind: "carnet",
    description:
      "Une vente au marché de 900 actions : elle prend 250 actions à 50,00 €, 500 à 49,99 € et 150 à 49,98 €. Prix moyen d'environ 49,99 €, et le dernier échange se fait à 49,98 € : le prix affiché baisse.",
    decimales: 2,
    ventes: ventesSimples,
    achats: achatsSimples,
    ordreMarche: { sens: "vente", quantite: 900, etape: 1 },
  },
  "pp-q-pression": {
    kind: "bougies",
    description: "Douze bougies d'une action fictive, de tailles et de sens variés.",
    bougies: ppQPression,
    decimales: 2,
    annotations: [],
  },
  "pp-q-carnet-lecture": {
    kind: "carnet",
    description: "Carnet d'ordres d'une action : cinq niveaux de vendeurs et cinq niveaux d'acheteurs.",
    decimales: 2,
    ventes: [
      { prix: 25.08, quantite: 400 },
      { prix: 25.11, quantite: 200 },
      { prix: 25.12, quantite: 350 },
      { prix: 25.15, quantite: 500 },
      { prix: 25.16, quantite: 300 },
    ],
    achats: [
      { prix: 25.05, quantite: 300 },
      { prix: 25.04, quantite: 450 },
      { prix: 25.02, quantite: 500 },
      { prix: 25.0, quantite: 800 },
      { prix: 24.98, quantite: 400 },
    ],
  },
  "pp-q-carnet-a": {
    kind: "carnet",
    description: "Carnet d'ordres A, cinq niveaux de chaque côté.",
    decimales: 2,
    ventes: ventesSimples,
    achats: achatsSimples,
  },
  "pp-q-carnet-b": {
    kind: "carnet",
    description: "Carnet d'ordres B, cinq niveaux de chaque côté.",
    decimales: 2,
    ventes: [
      { prix: 50.02, quantite: 500 },
      { prix: 50.03, quantite: 250 },
      { prix: 50.04, quantite: 200 },
      { prix: 50.05, quantite: 600 },
      { prix: 50.06, quantite: 350 },
    ],
    achats: achatsSimples,
  },

  // ── Chapitre 4 ──
  "pp-decision-taux": {
    kind: "bougies",
    description:
      "Une paire de devises fictive, heure par heure : douze heures calmes, puis la décision de taux d'une banque centrale. La bougie suivante baisse d'environ 0,5 % et les heures d'après restent agitées.",
    bougies: ppDecisionTaux,
    decimales: 4,
    revele: [12, 18],
    annotations: [{ type: "repere", index: 12, label: "Décision de taux", couleur: "gold", etape: 1 }],
  },
  "pp-ordre-institution": {
    kind: "carnet",
    description:
      "Un fonds achète 1 500 actions au marché : son ordre prend quatre niveaux du carnet, paie en moyenne environ 50,04 € et le dernier échange se fait à 50,05 €. Un gros ordre déplace le prix.",
    decimales: 2,
    ventes: ventesSimples,
    achats: achatsSimples,
    ordreMarche: { sens: "achat", quantite: 1500, etape: 1 },
  },
  "pp-ordre-particulier": {
    kind: "carnet",
    description: "Un particulier achète 50 actions au marché : tout est exécuté au meilleur prix, 50,02 €, sans déplacer le prix.",
    decimales: 2,
    ventes: ventesSimples,
    achats: achatsSimples,
    ordreMarche: { sens: "achat", quantite: 50, etape: 1 },
  },
  "pp-couverture": {
    kind: "bougies",
    description:
      "EUR/USD, en dollars pour un euro, sur treize semaines : de 1,0850 à 1,0600. Le dollar s'apprécie ; l'entreprise, couverte, paie ses dollars au taux fixé de 1,0850.",
    bougies: ppCouverture,
    decimales: 4,
    annotations: [
      { type: "niveau", prix: 1.085, label: "Taux fixé", couleur: "brand" },
      { type: "etiquette", index: 12, prix: ppCouverture[12].l, texte: "Échéance : 1,0600", position: "bas", couleur: "bear", etape: 1 },
    ],
  },
  "pp-q-annonce-taux": {
    kind: "bougies",
    description: "Une paire de devises fictive, heure par heure, le jour d'une décision de taux.",
    bougies: ppQAnnonceTaux,
    decimales: 4,
    annotations: [],
  },
  "pp-q-couverture": {
    kind: "bougies",
    description: "EUR/USD sur treize semaines, de 1,0850 à 1,1000 ; l'entreprise avait fixé son taux à 1,0850.",
    bougies: ppQCouverture,
    decimales: 4,
    annotations: [
      { type: "niveau", prix: 1.085, label: "Taux fixé", couleur: "brand" },
      { type: "niveau", prix: 1.1, label: "Marché à l'échéance", couleur: "bull", style: "pointille", de: 6 },
    ],
  },

  // ── Chapitre 5 ──
  "pp-carnet-illiquide": {
    kind: "carnet",
    description:
      "Carnet d'une petite action peu échangée, en FCFA : 2 450 à l'achat, 2 550 à la vente, soit 100 FCFA d'écart, et quelques dizaines d'actions seulement à chaque prix.",
    decimales: 0,
    ventes: [
      { prix: 2550, quantite: 40 },
      { prix: 2575, quantite: 25 },
      { prix: 2600, quantite: 60 },
      { prix: 2650, quantite: 30 },
      { prix: 2700, quantite: 50 },
    ],
    achats: [
      { prix: 2450, quantite: 35 },
      { prix: 2425, quantite: 20 },
      { prix: 2400, quantite: 55 },
      { prix: 2350, quantite: 40 },
      { prix: 2300, quantite: 30 },
    ],
  },
  "pp-stop-volatilite": {
    kind: "bougies",
    description:
      "EUR/USD en bougies de 15 minutes : environ 4 pips par bougie avant l'annonce, environ 18 après. Le stop placé 10 pips sous l'entrée est touché par la première bougie de l'annonce, puis le prix repasse au-dessus de l'entrée.",
    bougies: ppStopVolatilite,
    decimales: 4,
    revele: [12, 20],
    annotations: [
      { type: "niveau", prix: 1.085, label: "Entrée", couleur: "ink", style: "pointille", a: 11 },
      { type: "niveau", prix: 1.084, label: "Stop", couleur: "bear", a: 11 },
      { type: "ligne", de: { index: 11.5, prix: 1.084 }, a: { index: 19.5, prix: 1.084 }, couleur: "bear" },
      { type: "etiquette", index: 2, prix: ppStopVolatilite[2].l, texte: "4 pips", position: "bas", couleur: "info" },
      { type: "repere", index: 12, label: "Annonce", couleur: "gold", etape: 1 },
      { type: "etiquette", index: 12, prix: ppStopVolatilite[12].l, texte: "Stop touché", position: "bas", couleur: "bad", etape: 1 },
      { type: "etiquette", index: 15, prix: ppStopVolatilite[15].h, texte: "21 pips", couleur: "info", etape: 1 },
    ],
  },
  "pp-q-stop-serre": {
    kind: "bougies",
    description: "EUR/USD en bougies de 15 minutes, entrée à 1,0850 et stop à 1,0840 ; le marché devient soudain plus agité.",
    bougies: ppQStopSerre,
    decimales: 4,
    annotations: [
      { type: "niveau", prix: 1.085, couleur: "ink", style: "pointille", de: 3 },
      { type: "niveau", prix: 1.084, label: "Stop", couleur: "bear", de: 3 },
    ],
  },
  "pp-q-profondeur-a": {
    kind: "carnet",
    description: "Carnet d'ordres A, cinq niveaux de chaque côté.",
    decimales: 2,
    ventes: [
      { prix: 50.01, quantite: 200 },
      { prix: 50.02, quantite: 250 },
      { prix: 50.03, quantite: 300 },
      { prix: 50.04, quantite: 250 },
      { prix: 50.05, quantite: 300 },
    ],
    achats: [
      { prix: 50.0, quantite: 220 },
      { prix: 49.99, quantite: 260 },
      { prix: 49.98, quantite: 300 },
      { prix: 49.97, quantite: 240 },
      { prix: 49.96, quantite: 280 },
    ],
  },
  "pp-q-profondeur-b": {
    kind: "carnet",
    description: "Carnet d'ordres B, cinq niveaux de chaque côté.",
    decimales: 2,
    ventes: [
      { prix: 50.02, quantite: 3000 },
      { prix: 50.03, quantite: 3500 },
      { prix: 50.04, quantite: 2800 },
      { prix: 50.05, quantite: 4000 },
      { prix: 50.06, quantite: 3600 },
    ],
    achats: [
      { prix: 50.0, quantite: 3200 },
      { prix: 49.99, quantite: 2900 },
      { prix: 49.98, quantite: 3400 },
      { prix: 49.97, quantite: 3800 },
      { prix: 49.96, quantite: 3000 },
    ],
  },

  // ── Chapitre 6 ──
  "pp-ligne-vs-bougies": {
    kind: "bougies",
    description:
      "Quatorze bougies et la ligne qui relie leurs clôtures : la ligne ne montre ni le plus haut de 52,20 € de la septième séance, ni le plus bas de 49,90 € de la onzième.",
    bougies: ppLigne,
    decimales: 2,
    annotations: [
      { type: "courbe", points: ppLigne.map((b) => b.c), label: "Ligne des clôtures", couleur: "brand" },
      { type: "etiquette", index: 6, prix: 52.2, texte: "Plus haut : 52,20", couleur: "warn", etape: 1 },
      { type: "etiquette", index: 10, prix: 49.9, texte: "Plus bas : 49,90", position: "bas", couleur: "warn", etape: 1 },
    ],
  },
  "pp-bougie-chiffres": {
    kind: "bougies",
    description:
      "Une bougie d'une heure repérée parmi douze : ouverture 100,20 €, plus haut 100,50 €, plus bas 99,20 €, clôture 100,30 €. Mèche basse de 1,00 €, corps de 0,10 €.",
    bougies: ppBougieChiffres,
    decimales: 2,
    annotations: [
      { type: "repere", index: 8, couleur: "info" },
      { type: "etiquette", index: 8, prix: 100.5, texte: "Plus haut 100,50", couleur: "ink" },
      { type: "etiquette", index: 8, prix: 99.2, texte: "Plus bas 99,20", position: "bas", couleur: "ink" },
    ],
  },
  "pp-q-baissiere": {
    kind: "bougies",
    description: "Douze bougies d'une action fictive.",
    bougies: ppQBaissiere,
    decimales: 2,
    annotations: [],
  },
  "pp-q-meche-haute": {
    kind: "bougies",
    description: "Douze bougies d'une action fictive.",
    bougies: ppQMecheHaute,
    decimales: 2,
    annotations: [],
  },
  "pp-q-quatre-prix": {
    kind: "bougies",
    description: "Une bougie haussière repérée par quatre lettres : A, B, C et D.",
    bougies: ppQQuatrePrix,
    decimales: 2,
    annotations: [
      { type: "etiquette", index: 5, prix: 41.6, texte: "A", couleur: "ink" },
      { type: "etiquette", index: 5.5, prix: 41.0, texte: "B", couleur: "ink" },
      { type: "etiquette", index: 5.5, prix: 40.0, texte: "C", position: "bas", couleur: "ink" },
      { type: "etiquette", index: 5, prix: 39.3, texte: "D", position: "bas", couleur: "ink" },
    ],
  },
  "pp-q-rejet-a": {
    kind: "bougies",
    description: "Graphique A : onze bougies, puis une dernière bougie de grande amplitude.",
    bougies: [...ppQRejetBase, { o: 45.8, h: 45.9, l: 44.7, c: 44.8 }],
    decimales: 2,
    annotations: [{ type: "repere", index: 11, couleur: "info" }],
  },
  "pp-q-rejet-b": {
    kind: "bougies",
    description: "Graphique B : onze bougies, puis une dernière bougie de grande amplitude.",
    bougies: [...ppQRejetBase, { o: 45.8, h: 45.95, l: 44.75, c: 45.7 }],
    decimales: 2,
    annotations: [{ type: "repere", index: 11, couleur: "info" }],
  },

  // ── Chapitre 7 ──
  "pp-h1-vers-h4": {
    kind: "unites-de-temps",
    description:
      "Vingt-quatre bougies d'une heure regroupées en six bougies de quatre heures : ouverture de la première, plus haut et plus bas du groupe, clôture de la dernière.",
    bougies: ppH1VersH4,
    groupe: 4,
    decimales: 4,
    libelleCourt: "24 bougies d'une heure",
    libelleLong: "6 bougies de 4 heures",
  },
  "pp-echelles-tendance": {
    kind: "bougies",
    description:
      "Trente séances d'une action fictive : nette hausse sur l'ensemble, baisse sur les sept dernières. Haussier à l'échelle du mois, baissier à l'échelle de la semaine.",
    bougies: ppEchelles,
    decimales: 2,
    annotations: [
      { type: "ligne", de: { index: 0, prix: ppEchelles[0].l }, a: { index: 22, prix: ppEchelles[22].c }, label: "Hausse de fond", couleur: "bull" },
      {
        type: "zone",
        prixHaut: Math.max(...ppEchelles.slice(23).map((b) => b.h)),
        prixBas: Math.min(...ppEchelles.slice(23).map((b) => b.l)),
        de: 23,
        a: 29,
        couleur: "bear",
        etape: 1,
      },
      { type: "etiquette", index: 27, prix: Math.max(...ppEchelles.slice(23).map((b) => b.h)), texte: "Repli", couleur: "bear", etape: 1 },
    ],
  },
  "pp-exemple-h1": {
    kind: "unites-de-temps",
    description:
      "Les quatre bougies de 15 minutes du tableau regroupées en une bougie d'une heure : ouverture 1,0850, plus haut 1,0868, plus bas 1,0846, clôture 1,0861.",
    bougies: quartsDHeure.slice(0, 4),
    groupe: 4,
    decimales: 4,
    libelleCourt: "4 bougies de 15 minutes, de 10 h à 11 h",
    libelleLong: "1 bougie d'une heure",
  },
  "pp-q-echelles": {
    kind: "bougies",
    description: "Trente séances d'une action fictive, en bougies journalières.",
    bougies: ppEchelles,
    decimales: 2,
    annotations: [],
  },
  "pp-q-m15-heures": {
    kind: "bougies",
    description: "Douze bougies de 15 minutes d'EUR/USD, soit trois heures, séparées par des pointillés.",
    bougies: ppQM15Heures,
    decimales: 4,
    annotations: [
      ...separateursHeures,
      { type: "etiquette", index: 1.5, prix: 1.0942, texte: "1re heure", couleur: "ink" },
      { type: "etiquette", index: 5.5, prix: 1.0942, texte: "2e heure", couleur: "ink" },
      { type: "etiquette", index: 9.5, prix: 1.0942, texte: "3e heure", couleur: "ink" },
    ],
  },
  "pp-q-regroupe-a": {
    kind: "unites-de-temps",
    description: "Cas A : quatre bougies de 15 minutes, avant regroupement.",
    bougies: [
      { o: 1.085, h: 1.0853, l: 1.0845, c: 1.0846 },
      { o: 1.0846, h: 1.0848, l: 1.0841, c: 1.0843 },
      { o: 1.0843, h: 1.0845, l: 1.0838, c: 1.084 },
      { o: 1.084, h: 1.0859, l: 1.0839, c: 1.0856 },
    ],
    groupe: 4,
    decimales: 4,
    libelleCourt: "4 bougies de 15 minutes",
    libelleLong: "1 bougie d'une heure",
  },
  "pp-q-regroupe-b": {
    kind: "unites-de-temps",
    description: "Cas B : quatre bougies de 15 minutes, avant regroupement.",
    bougies: [
      { o: 1.085, h: 1.0854, l: 1.0849, c: 1.0853 },
      { o: 1.0853, h: 1.0857, l: 1.0852, c: 1.0856 },
      { o: 1.0856, h: 1.086, l: 1.0855, c: 1.0859 },
      { o: 1.0859, h: 1.086, l: 1.0842, c: 1.0845 },
    ],
    groupe: 4,
    decimales: 4,
    libelleCourt: "4 bougies de 15 minutes",
    libelleLong: "1 bougie d'une heure",
  },

  // ── Chapitre 8 ──
  "pp-achat-limite": {
    kind: "bougies",
    description:
      "Achat limite placé à 49,00 € quand le prix est à 50,00 € : l'ordre attend, le prix descend jusqu'à 49,00 €, l'ordre est exécuté, puis le prix remonte.",
    bougies: ppAchatLimite,
    decimales: 2,
    revele: [8, 14],
    annotations: [
      { type: "fleche", index: 2, prix: ppAchatLimite[2].h, sens: "bas", label: "Ordre placé", couleur: "ink" },
      { type: "niveau", prix: 49.0, label: "Achat limite", couleur: "bull", de: 2 },
      { type: "etiquette", index: 8, prix: 48.9, texte: "Exécuté à 49,00", position: "bas", couleur: "bull", etape: 1 },
    ],
  },
  "pp-achat-stop-gap": {
    kind: "bougies",
    description:
      "Achat stop à 51,00 € : le marché rouvre directement à 51,40 €. L'ordre déclenché est exécuté à ce premier prix disponible, 0,40 € plus cher que prévu.",
    bougies: ppAchatStopGap,
    decimales: 2,
    revele: [7, 8, 12],
    annotations: [
      { type: "niveau", prix: 51.0, label: "Achat stop", couleur: "bull", style: "pointille", a: 6 },
      { type: "repere", index: 7, label: "Gap", couleur: "gold", etape: 1 },
      { type: "etiquette", index: 8.5, prix: ppAchatStopGap[7].l, texte: "Exécution à 51,40", position: "bas", couleur: "warn", etape: 1 },
    ],
  },
  "pp-trois-ordres": {
    kind: "bougies",
    description:
      "Le prix part d'environ 50 € et monte au-delà de 52 € : l'achat au marché est servi tout de suite, l'achat stop à 51,50 € est déclenché pendant la hausse, l'achat limite à 48,50 € n'est jamais exécuté.",
    bougies: ppTroisOrdres,
    decimales: 2,
    revele: [4, 14],
    annotations: [
      { type: "fleche", index: 0, prix: ppTroisOrdres[0].l, sens: "haut", couleur: "bull" },
      { type: "etiquette", index: 1.5, prix: ppTroisOrdres[0].l, texte: "Au marché", position: "bas", couleur: "bull" },
      { type: "niveau", prix: 51.5, label: "Achat stop", couleur: "bull", style: "pointille", a: 9 },
      { type: "niveau", prix: 48.5, label: "Achat limite", couleur: "bull" },
      { type: "repere", index: 10, label: "Stop déclenché", couleur: "brand", etape: 1 },
      { type: "etiquette", index: 4, prix: 48.5, texte: "Jamais atteint", couleur: "gold", etape: 1 },
    ],
  },
  "pp-q-limite-execution": {
    kind: "bougies",
    description: "Achat limite placé à 24,50 € ; le prix évolue pendant douze séances.",
    bougies: ppQLimiteExecution,
    decimales: 2,
    annotations: [{ type: "niveau", prix: 24.5, couleur: "bull" }],
  },
  "pp-q-niveaux-ab": {
    kind: "bougies",
    description: "Une action fictive à 50,40 € et deux niveaux : A au-dessus, à 51,90 €, B en dessous, à 48,90 €.",
    bougies: ppNiveaux,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.4, label: "Prix actuel", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 51.9, label: "A", couleur: "info" },
      { type: "niveau", prix: 48.9, label: "B", couleur: "info" },
    ],
  },
  "pp-q-stop-place-a": {
    kind: "bougies",
    description: "Graphique A : le prix actuel et un ordre d'achat stop.",
    bougies: ppNiveaux,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.4, label: "Prix actuel", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 48.9, label: "Achat stop", couleur: "bull", style: "pointille" },
    ],
  },
  "pp-q-stop-place-b": {
    kind: "bougies",
    description: "Graphique B : le prix actuel et un ordre d'achat stop.",
    bougies: ppNiveaux,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.4, label: "Prix actuel", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 51.9, label: "Achat stop", couleur: "bull", style: "pointille" },
    ],
  },
  "pp-q-limite-au-dessus": {
    kind: "bougies",
    description: "Un achat limite placé à 51,00 € alors que le prix est à 50,00 €.",
    bougies: ppQLimiteDessus,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.0, label: "Prix actuel", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 51.0, label: "Achat limite", couleur: "bull" },
    ],
  },
  "pp-e-achat-stop": {
    kind: "bougies",
    description: "Un achat stop placé à 51,50 € ; le prix évolue pendant quatorze séances.",
    bougies: ppEAchatStop,
    decimales: 2,
    annotations: [{ type: "niveau", prix: 51.5, couleur: "bull", style: "pointille" }],
  },

  // ── Chapitre 9 ──
  "pp-sl-tp-vente": {
    kind: "bougies",
    description:
      "Position vendeuse à 60,50 € : stop loss au-dessus, à 61,70 €, take profit en dessous, à 58,10 €. Le prix monte d'abord sans toucher le stop, puis baisse jusqu'à l'objectif.",
    bougies: ppSlTpVente,
    decimales: 2,
    revele: [3, 3, 3, 15],
    annotations: [
      { type: "niveau", prix: 60.5, label: "Entrée (vente)", couleur: "ink", style: "pointille", de: 2 },
      { type: "zone", prixHaut: 61.7, prixBas: 60.5, de: 2, a: 14, couleur: "bear", etape: 1 },
      { type: "niveau", prix: 61.7, label: "Stop loss", couleur: "bear", de: 2, etape: 1 },
      { type: "zone", prixHaut: 60.5, prixBas: 58.1, de: 2, a: 14, couleur: "bull", etape: 2 },
      { type: "niveau", prix: 58.1, label: "Take profit", couleur: "bull", de: 2, a: 13, etape: 2 },
    ],
  },
  "pp-stop-invalidation": {
    kind: "bougies",
    description:
      "Le prix rebondit trois fois au-dessus de 48,00 €. Achat à 50,00 € ; le stop va juste sous ce support, à 47,80 € : s'il est touché, l'idée « le prix tient au-dessus de 48 € » est fausse.",
    bougies: ppSupport,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 48.0, label: "Support", couleur: "info", style: "pointille" },
      { type: "etiquette", index: 2, prix: 48.1, texte: "Creux", position: "bas", couleur: "info" },
      { type: "etiquette", index: 6, prix: 48.15, texte: "Creux", position: "bas", couleur: "info" },
      { type: "etiquette", index: 9, prix: 48.2, texte: "Creux", position: "bas", couleur: "info" },
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille", de: 12, etape: 1 },
      { type: "niveau", prix: 47.8, label: "Stop", couleur: "bear", de: 12, etape: 1 },
    ],
  },
  "pp-stop-trop-serre": {
    kind: "bougies",
    description:
      "Entrée à 50,00 € avec un stop serré à 49,70 € : une petite baisse ordinaire le touche, puis le prix monte jusqu'à l'objectif de 51,50 €. Un stop sous le dernier creux, à 48,90 €, aurait tenu.",
    bougies: ppStopSerre,
    decimales: 2,
    revele: [7, 15],
    annotations: [
      { type: "niveau", prix: 51.5, label: "Objectif", couleur: "bull", style: "pointille", de: 6, a: 13 },
      { type: "etiquette", index: 6, prix: ppStopSerre[6].h, texte: "Entrée 50,00", couleur: "ink" },
      { type: "niveau", prix: 49.7, label: "Stop serré", couleur: "bear", de: 6 },
      { type: "niveau", prix: 48.9, label: "Stop sous le creux", couleur: "info", style: "pointille", de: 4 },
      { type: "etiquette", index: 7, prix: ppStopSerre[7].l, texte: "Stop touché", position: "bas", couleur: "bad", etape: 1 },
    ],
  },
  "pp-q-stop-touche": {
    kind: "bougies",
    description: "Achat à 50,00 € avec un stop loss à 48,80 € ; le prix évolue pendant quatorze séances.",
    bougies: ppQStopTouche,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille", de: 1, a: 10 },
      { type: "niveau", prix: 48.8, label: "Stop loss", couleur: "bear", de: 1 },
    ],
  },
  "pp-q-plan-a": {
    kind: "bougies",
    description: "Plan A : achat à 50,00 € et stop à 49,40 €, sur un prix qui a rebondi trois fois au-dessus de 48,00 €.",
    bougies: ppSupport,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 48.0, label: "Support", couleur: "info", style: "pointille" },
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille", de: 12 },
      { type: "niveau", prix: 49.4, couleur: "bear", de: 12 },
    ],
  },
  "pp-q-plan-b": {
    kind: "bougies",
    description: "Plan B : achat à 50,00 € et stop à 47,80 €, sur un prix qui a rebondi trois fois au-dessus de 48,00 €.",
    bougies: ppSupport,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 48.0, label: "Support", couleur: "info", style: "pointille" },
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille", de: 12 },
      { type: "niveau", prix: 47.8, label: "Stop", couleur: "bear", de: 12 },
    ],
  },
  "pp-q-stop-serre-plan": {
    kind: "bougies",
    description: "Achat à 50,00 €, stop à 49,70 €, objectif à 51,50 € ; le prix évolue pendant quinze séances.",
    bougies: ppStopSerre,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 51.5, label: "Objectif", couleur: "bull", style: "pointille", de: 6, a: 13 },
      { type: "etiquette", index: 6, prix: ppStopSerre[6].h, texte: "Entrée 50,00", couleur: "ink" },
      { type: "niveau", prix: 49.7, label: "Stop", couleur: "bear", de: 6 },
    ],
  },

  // ── Chapitre 10 ──
  "pp-spread-depart": {
    kind: "bougies",
    description:
      "Achat à l'ask, 1,0852, alors que le bid est à 1,0850 ; les bougies montrent le bid. La position démarre 2 pips en perte et revient à zéro quand le bid dépasse 1,0852, à la neuvième bougie.",
    bougies: ppSpreadDepart,
    decimales: 4,
    annotations: [
      { type: "niveau", prix: 1.0852, label: "Achat à l'ask", couleur: "bull", style: "pointille", de: 3, a: 7 },
      { type: "zone", prixHaut: 1.0852, prixBas: 1.085, de: 3, a: 11, couleur: "warn" },
      { type: "etiquette", index: 10, prix: 1.085, texte: "Spread : 2 pips", position: "bas", couleur: "warn" },
      { type: "repere", index: 8, label: "Retour à zéro", couleur: "ok", etape: 1 },
    ],
  },
  "pp-couts-objectif": {
    kind: "bougies",
    description: "Entrée à 1,08500, objectif à 1,08600 : 10 pips. Les coûts d'un aller-retour, 1,5 pip, prennent déjà 15 % de ce chemin.",
    bougies: ppCoutsObjectif,
    decimales: 5,
    annotations: [
      { type: "niveau", prix: 1.086, label: "Objectif : 10 pips", couleur: "bull", style: "pointille", de: 4 },
      { type: "zone", prixHaut: 1.08515, prixBas: 1.085, de: 4, a: 12, couleur: "bad" },
      { type: "etiquette", index: 10, prix: 1.085, texte: "Coûts : 1,5 pip", position: "bas", couleur: "bad" },
      { type: "niveau", prix: 1.085, label: "Entrée", couleur: "ink", style: "pointille", a: 4 },
    ],
  },
  "pp-q-retour-zero": {
    kind: "bougies",
    description: "Le bid d'EUR/USD en bougies de 5 minutes, après un achat à l'ask de 1,0852.",
    bougies: ppQRetourZero,
    decimales: 4,
    annotations: [{ type: "niveau", prix: 1.0852, couleur: "bull", style: "pointille" }],
  },
  "pp-q-carnet-couts": {
    kind: "carnet",
    description: "Carnet d'ordres d'une action : cinq niveaux de vendeurs et cinq niveaux d'acheteurs.",
    decimales: 2,
    ventes: [
      { prix: 25.05, quantite: 600 },
      { prix: 25.06, quantite: 400 },
      { prix: 25.08, quantite: 500 },
      { prix: 25.1, quantite: 300 },
      { prix: 25.12, quantite: 800 },
    ],
    achats: [
      { prix: 25.0, quantite: 500 },
      { prix: 24.98, quantite: 700 },
      { prix: 24.97, quantite: 300 },
      { prix: 24.95, quantite: 600 },
      { prix: 24.92, quantite: 400 },
    ],
  },
  "pp-q-objectif-court": {
    kind: "bougies",
    description: "Plan A : entrée à 1,08500, objectif à 1,08600, coûts d'un aller-retour de 1,5 pip.",
    bougies: ppQObjectif,
    decimales: 5,
    annotations: [
      { type: "niveau", prix: 1.086, label: "Objectif", couleur: "bull", style: "pointille", de: 4 },
      { type: "zone", prixHaut: 1.08515, prixBas: 1.085, de: 4, a: 11, couleur: "bad" },
      { type: "etiquette", index: 10, prix: 1.085, texte: "Coûts", position: "bas", couleur: "bad" },
      { type: "niveau", prix: 1.085, label: "Entrée", couleur: "ink", style: "pointille", a: 4 },
    ],
  },
  "pp-q-objectif-long": {
    kind: "bougies",
    description: "Plan B : entrée à 1,08500, objectif à 1,09000, mêmes coûts d'un aller-retour de 1,5 pip.",
    bougies: ppQObjectif,
    decimales: 5,
    annotations: [
      { type: "niveau", prix: 1.09, label: "Objectif", couleur: "bull", style: "pointille", de: 4 },
      { type: "zone", prixHaut: 1.08515, prixBas: 1.085, de: 4, a: 11, couleur: "bad" },
      { type: "etiquette", index: 10, prix: 1.085, texte: "Coûts", position: "bas", couleur: "bad" },
      { type: "niveau", prix: 1.085, label: "Entrée", couleur: "ink", style: "pointille", a: 4 },
    ],
  },
  "pp-q-gap-stop": {
    kind: "bougies",
    description: "EUR/USD avant et après un week-end, avec un stop à 1,0820 : le marché rouvre plus bas.",
    bougies: ppQGapStop,
    decimales: 4,
    annotations: [
      { type: "niveau", prix: 1.082, label: "Stop", couleur: "bear", style: "pointille" },
      { type: "repere", index: 8, label: "Lundi", couleur: "gold" },
    ],
  },

  // ── Chapitre 11 ──
  "pp-usdjpy-45-pips": {
    kind: "bougies",
    description: "USD/JPY passe de 150,20 à 150,65 : une hausse de 0,45 yen, soit 45 pips, car le pip vaut 0,01 pour les paires contre le yen.",
    bougies: ppUsdJpy,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 150.2, label: "Départ", couleur: "ink", style: "pointille" },
      { type: "zone", prixHaut: 150.65, prixBas: 150.2, de: 0, a: 11, label: "45 pips", couleur: "brand", etape: 1 },
      { type: "niveau", prix: 150.65, label: "Arrivée", couleur: "brand", etape: 1 },
    ],
  },
  "pp-pipettes": {
    kind: "bougies",
    description: "EUR/USD affiché à cinq décimales : de 1,08503 à 1,08553, le prix monte de 0,00050, soit 5 pips, ou 50 pipettes.",
    bougies: ppPipettes,
    decimales: 5,
    annotations: [
      { type: "niveau", prix: 1.08503, label: "Départ", couleur: "ink", style: "pointille" },
      { type: "zone", prixHaut: 1.08553, prixBas: 1.08503, de: 0, a: 11, label: "5 pips = 50 pipettes", couleur: "brand", etape: 1 },
      { type: "niveau", prix: 1.08553, label: "Arrivée", couleur: "brand", etape: 1 },
    ],
  },
  "pp-indice-50-points": {
    kind: "bougies",
    description: "Un indice fictif passe de 18 000 à 18 050 : 50 points. Ce qu'ils valent en argent dépend du contrat.",
    bougies: ppIndice,
    decimales: 0,
    annotations: [
      { type: "niveau", prix: 18000, label: "Départ", couleur: "ink", style: "pointille" },
      { type: "zone", prixHaut: 18050, prixBas: 18000, de: 0, a: 11, label: "50 points", couleur: "brand", etape: 1 },
      { type: "niveau", prix: 18050, label: "Arrivée", couleur: "brand", etape: 1 },
    ],
  },
  "pp-q-corps-pips": {
    kind: "bougies",
    description: "Douze bougies d'EUR/USD, cotées à quatre décimales.",
    bougies: ppQCorps,
    decimales: 4,
    annotations: [],
  },
  "pp-q-mouvement-jpy": {
    kind: "bougies",
    description: "EUR/JPY, cotée à deux décimales, entre un point de départ et un point d'arrivée.",
    bougies: ppQEurJpy,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 161.7, label: "Départ", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 162.45, label: "Arrivée", couleur: "brand" },
    ],
  },
  "pp-q-pips-a": {
    kind: "bougies",
    description: "Graphique A : EUR/USD, de 1,0850 à 1,0880.",
    bougies: ppQPipsA,
    decimales: 4,
    annotations: [
      { type: "niveau", prix: 1.085, label: "Départ", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 1.088, label: "Arrivée", couleur: "brand" },
    ],
  },
  "pp-q-pips-b": {
    kind: "bougies",
    description: "Graphique B : USD/JPY, de 150,20 à 150,45.",
    bougies: ppQPipsB,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 150.2, label: "Départ", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 150.45, label: "Arrivée", couleur: "brand" },
    ],
  },
  "pp-q-perte-pips": {
    kind: "bougies",
    description: "EUR/USD depuis une vente à 1,0850 ; le prix est maintenant à 1,0875.",
    bougies: ppQPertePips,
    decimales: 4,
    annotations: [
      { type: "niveau", prix: 1.085, label: "Vente", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 1.0875, label: "Prix actuel", couleur: "bear" },
    ],
  },

  // ── Chapitre 12 ──
  "pp-levier-3pct": {
    kind: "levier",
    description:
      "Avec 1 000 € de capital et une baisse de 3 % : 30 € de perte pour une position de 1 000 €, 150 € pour 5 000 €, 300 € pour 10 000 €. La perte, en pourcentage du capital, vaut le levier utilisé multiplié par 3 %.",
    capital: 1000,
    leviers: [1, 5, 10],
    variationPct: 3,
  },
  "pp-stop-out": {
    kind: "bougies",
    description:
      "Capital de 1 000 €, position de 20 000 € sur un indice à 1 € par point, achetée à 20 000. Quand le capital restant tombe à 500 €, la moitié de la marge de 1 000 €, le courtier ferme la position à 19 500 ; le prix remonte ensuite, sans toi.",
    bougies: ppStopOut,
    decimales: 0,
    revele: [14, 17],
    annotations: [
      { type: "niveau", prix: 20000, label: "Entrée", couleur: "ink", style: "pointille" },
      { type: "ligne", de: { index: -0.5, prix: 19500 }, a: { index: 16.5, prix: 19500 }, couleur: "bad" },
      { type: "etiquette", index: 3.5, prix: 19500, texte: "Fermeture à 19 500", position: "bas", couleur: "bad" },
      { type: "repere", index: 13, label: "Stop out", couleur: "bad", etape: 1 },
    ],
  },
  "pp-levier-2pct": {
    kind: "levier",
    description:
      "Avec 2 000 € de capital et une baisse de 2 % : 40 € de perte sans levier, 400 € avec 1:10, et 1 200 € avec 1:30 si toute la position permise est ouverte, soit 60 % du capital.",
    capital: 2000,
    leviers: [1, 10, 30],
    variationPct: 2,
  },
  "pp-q-stop-out": {
    kind: "bougies",
    description: "Un indice fictif après un achat à 20 000 points ; le prix évolue pendant quinze séances.",
    bougies: ppQStopOut,
    decimales: 0,
    annotations: [{ type: "niveau", prix: 20000, label: "Entrée", couleur: "ink", style: "pointille" }],
  },
  "pp-q-levier-baisse": {
    kind: "bougies",
    description: "Un indice fictif acheté à 20 000 points, qui cote maintenant 19 600.",
    bougies: ppQLevierBaisse,
    decimales: 0,
    annotations: [
      { type: "niveau", prix: 20000, label: "Entrée", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 19600, label: "Actuel", couleur: "bear" },
    ],
  },

  // ── Chapitre 13 ──
  "pp-stop-25-pips": {
    kind: "bougies",
    description:
      "EUR/USD : entrée à 1,0850, stop à 1,0825 juste sous le dernier creux, soit 25 pips. Avec 20 $ de risque et 10 $ par pip pour un lot, la taille est de 20 ÷ (25 × 10) = 0,08 lot.",
    bougies: ppStop25Pips,
    decimales: 4,
    annotations: [
      { type: "etiquette", index: 3, prix: ppStop25Pips[3].l, texte: "Dernier creux", position: "bas", couleur: "info" },
      { type: "niveau", prix: 1.085, label: "Entrée", couleur: "ink", style: "pointille", de: 7 },
      { type: "zone", prixHaut: 1.085, prixBas: 1.0825, de: 7, a: 11, couleur: "bear", etape: 1 },
      { type: "etiquette", index: 7, prix: 1.0825, texte: "25 pips", couleur: "bear", etape: 1 },
      { type: "niveau", prix: 1.0825, label: "Stop", couleur: "bear", de: 7, etape: 1 },
    ],
  },
  "pp-taille-deux-stops": {
    kind: "bougies",
    description:
      "Entrée à 50,00 €, deux stops possibles : à 49,00 €, sous le petit creux récent, ou à 45,00 €, sous le grand creux. Avec 20 € de risque : 20 actions dans le premier cas, 4 dans le second.",
    bougies: ppDeuxStops,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille", de: 10 },
      { type: "ligne", de: { index: 8.5, prix: 49.0 }, a: { index: 11.5, prix: 49.0 }, couleur: "bear" },
      { type: "etiquette", index: 4.5, prix: 49.0, texte: "Stop proche : 20 actions", couleur: "bear" },
      { type: "niveau", prix: 45.0, label: "Stop lointain", couleur: "bear", style: "pointille", de: 2 },
      { type: "etiquette", index: 5, prix: 45.0, texte: "4 actions", position: "bas", couleur: "bear" },
    ],
  },
  "pp-q-creux-stop": {
    kind: "bougies",
    description: "Douze bougies d'une action fictive avant un achat à la dernière clôture.",
    bougies: ppQCreuxStop,
    decimales: 2,
    annotations: [],
  },
  "pp-q-taille-fcfa": {
    kind: "bougies",
    description: "Action cotée en FCFA : entrée prévue à 2 000, stop à 1 960.",
    bougies: ppQTailleFcfa,
    decimales: 0,
    annotations: [
      { type: "niveau", prix: 2000, label: "Entrée", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 1960, label: "Stop", couleur: "bear" },
    ],
  },
  "pp-q-deux-stops-a": {
    kind: "bougies",
    description: "Plan A : entrée à 50,00 €, stop à 49,00 €.",
    bougies: ppDeuxStops,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille", de: 10 },
      { type: "ligne", de: { index: 8.5, prix: 49.0 }, a: { index: 11.5, prix: 49.0 }, couleur: "bear" },
      { type: "etiquette", index: 5.5, prix: 49.0, texte: "Stop : 49,00", couleur: "bear" },
    ],
  },
  "pp-q-deux-stops-b": {
    kind: "bougies",
    description: "Plan B : entrée à 50,00 €, stop à 45,00 €.",
    bougies: ppDeuxStops,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille", de: 10 },
      { type: "niveau", prix: 45.0, label: "Stop", couleur: "bear", de: 2 },
    ],
  },
  "pp-q-taille-forex": {
    kind: "bougies",
    description: "EUR/USD : entrée prévue à 1,0850, stop à 1,0830.",
    bougies: ppQTailleForex,
    decimales: 4,
    annotations: [
      { type: "niveau", prix: 1.085, label: "Entrée", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 1.083, label: "Stop", couleur: "bear" },
    ],
  },

  // ── Chapitre 14 ──
  "pp-unites-r": {
    kind: "bougies",
    description:
      "Entrée à 50,00 €, stop à 48,00 € : le risque de 2,00 € par action devient l'unité R. Les objectifs se lisent en multiples : 52,00 € à +1R, 54,00 € à +2R, 56,00 € à +3R.",
    bougies: ppUnitesR,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille", de: 7 },
      { type: "zone", prixHaut: 50.0, prixBas: 48.0, de: 7, a: 13, couleur: "bear" },
      { type: "etiquette", index: 10, prix: 49.0, texte: "1R = 2,00 €", couleur: "bear" },
      { type: "niveau", prix: 48.0, label: "Stop : −1R", couleur: "bear", de: 7 },
      { type: "niveau", prix: 52.0, label: "+1R", couleur: "bull", style: "pointille", de: 7, etape: 1 },
      { type: "niveau", prix: 54.0, label: "+2R", couleur: "bull", style: "pointille", de: 7, etape: 1 },
      { type: "niveau", prix: 56.0, label: "+3R", couleur: "bull", style: "pointille", de: 7, etape: 1 },
    ],
  },
  "pp-serie-a": {
    kind: "series",
    description: "Méthode A sur vingt trades : 12 gains de 1R et 8 pertes de 1R, soit +4R au total, avec au plus 2 pertes d'affilée.",
    resultats: [1, 1, -1, 1, -1, 1, 1, -1, 1, 1, -1, -1, 1, 1, 1, -1, 1, -1, 1, -1],
  },
  "pp-serie-b": {
    kind: "series",
    description: "Méthode B sur vingt trades : 8 gains de 2R et 12 pertes de 1R, soit +4R aussi, avec jusqu'à 3 pertes d'affilée.",
    resultats: [-1, 2, -1, -1, 2, -1, -1, -1, 2, -1, 2, -1, -1, 2, -1, 2, -1, -1, 2, 2],
  },
  "pp-q-objectif-2r": {
    kind: "bougies",
    description: "Achat à 50,00 € avec un stop à 48,00 € ; le prix évolue pendant quinze séances.",
    bougies: ppQObjectif2R,
    decimales: 2,
    annotations: [
      { type: "niveau", prix: 50.0, label: "Entrée", couleur: "ink", style: "pointille" },
      { type: "niveau", prix: 48.0, label: "Stop", couleur: "bear" },
    ],
  },
  "pp-q-serie": {
    kind: "series",
    description: "Vingt trades, en R : chaque barre est un gain ou une perte.",
    resultats: [-1, -1, 2, -1, -1, -1, 2, -1, 2, -1, -1, -1, -1, 2, -1, -1, 2, -1, 2, -1],
  },
  "pp-q-serie-a": {
    kind: "series",
    description: "Série A : vingt résultats de trades, en R.",
    resultats: [0.5, 0.5, -1, 0.5, 0.5, 0.5, -1, 0.5, -1, 0.5, 0.5, -1, 0.5, 0.5, -1, 0.5, -1, 0.5, 0.5, -1],
  },
  "pp-q-serie-b": {
    kind: "series",
    description: "Série B : vingt résultats de trades, en R.",
    resultats: [2, -1, -1, 2, -1, -1, -1, 2, -1, -1, 2, -1, 2, -1, -1, -1, 2, -1, 2, -1],
  },
};

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
  ...scenesPremiersPas,
};

/**
 * Scènes des chapitres payants : elles arrivent avec le contenu, servi par la base à qui a un droit d'accès,
 * et rejoignent ce registre dans le navigateur. Une scène publique n'est jamais remplacée.
 */
export function ajouterScenes(extra: Record<string, SceneFigure>) {
  for (const [id, s] of Object.entries(extra)) if (!(id in scenes)) scenes[id] = s;
}
