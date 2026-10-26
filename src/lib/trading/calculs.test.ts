import { describe, expect, it } from "vitest";
import { scenes } from "@/content/scenes";
import {
  esperance,
  gainPourRecuperer,
  margeRequise,
  perteSurCapitalPct,
  pipsEntre,
  plusLongueSerie,
  probabiliteSerieDePertes,
  ratioRendementRisque,
  seuilRentabilite,
  seuilRentabiliteAvecFrais,
  taillePositionPrix,
  tailleLots,
  valeurPipParLot,
} from "./calculs";

describe("seuil de rentabilité et espérance", () => {
  it("donne 50 %, 33,3 % et 25 % pour des ratios de 1, 2 et 3", () => {
    expect(seuilRentabilite(1)).toBe(0.5);
    expect(seuilRentabilite(2)).toBeCloseTo(1 / 3, 12);
    expect(seuilRentabilite(3)).toBe(0.25);
  });

  it("avec frais, annule exactement l'espérance nette", () => {
    const ratio = 2;
    const frais = 0.1;
    const p = seuilRentabiliteAvecFrais(ratio, frais);
    expect(esperance(p, ratio - frais, 1 + frais)).toBeCloseTo(0, 12);
  });

  it("calcule les espérances des méthodes du chapitre 14", () => {
    expect(esperance(0.6, 1, 1)).toBeCloseTo(0.2, 12);
    expect(esperance(0.4, 2, 1)).toBeCloseTo(0.2, 12);
    expect(esperance(0.7, 0.5, 1)).toBeCloseTo(0.05, 12);
    expect(esperance(0.3, 2, 1)).toBeCloseTo(-0.1, 12);
  });

  it("retrouve la série de six pertes et le total de +1R de la figure", () => {
    const s = scenes["series-resultats"];
    if (s.kind !== "series") throw new Error("type de scène inattendu");
    expect(plusLongueSerie(s.resultats)).toBe(6);
    expect(s.resultats.reduce((a, b) => a + b, 0)).toBe(1);
    expect(s.resultats.filter((r) => r > 0)).toHaveLength(7);
  });
});

describe("séries de pertes", () => {
  it("vaut q^k quand n = k", () => {
    expect(probabiliteSerieDePertes(5, 5, 0.6)).toBeCloseTo(0.6 ** 5, 12);
  });

  it("donne les probabilités citées dans les cours", () => {
    expect(probabiliteSerieDePertes(100, 6, 0.6)).toBeCloseTo(0.8726, 3);
    expect(probabiliteSerieDePertes(100, 8, 0.6)).toBeCloseTo(0.4897, 3);
  });

  it("est nulle si la série est plus longue que le nombre de trades", () => {
    expect(probabiliteSerieDePertes(4, 5, 0.9)).toBe(0);
  });
});

describe("ratio rendement/risque", () => {
  it("calcule le plan d'achat du chapitre 9", () => {
    const r = ratioRendementRisque({ sens: "achat", entree: 50, stop: 47.8, objectif: 54.4 });
    if ("erreur" in r) throw new Error(r.erreur);
    expect(r.ratio).toBeCloseTo(2, 10);
    expect(r.risque).toBeCloseTo(2.2, 10);
  });

  it("refuse des niveaux incohérents", () => {
    expect(ratioRendementRisque({ sens: "achat", entree: 50, stop: 52, objectif: 55 })).toHaveProperty("erreur");
    expect(ratioRendementRisque({ sens: "vente", entree: 50, stop: 48, objectif: 45 })).toHaveProperty("erreur");
  });

  it("accepte une vente cohérente", () => {
    const r = ratioRendementRisque({ sens: "vente", entree: 100, stop: 102, objectif: 94 });
    if ("erreur" in r) throw new Error(r.erreur);
    expect(r.ratio).toBeCloseTo(3, 10);
  });
});

describe("taille de position", () => {
  it("donne 10 actions pour 20 € de risque et 2 € de distance", () => {
    const r = taillePositionPrix({ capital: 2000, risquePct: 1, entree: 50, stop: 48 });
    if ("erreur" in r) throw new Error(r.erreur);
    expect(r.quantiteArrondie).toBe(10);
    expect(r.risqueEffectif).toBeCloseTo(20, 10);
  });

  it("arrondit vers le bas", () => {
    const r = taillePositionPrix({ capital: 1000, risquePct: 1, entree: 30, stop: 27 });
    if ("erreur" in r) throw new Error(r.erreur);
    expect(r.quantite).toBeCloseTo(3.333, 3);
    expect(r.quantiteArrondie).toBe(3);
    expect(r.risqueEffectif).toBeLessThanOrEqual(r.montantRisque);
  });

  it("calcule les lots des exemples Forex", () => {
    const a = tailleLots({ capital: 2000, risquePct: 1, stopPips: 25, valeurPipParLot: 10 });
    const b = tailleLots({ capital: 3000, risquePct: 1, stopPips: 30, valeurPipParLot: 10 });
    if ("erreur" in a || "erreur" in b) throw new Error("calcul refusé");
    expect(a.lotsArrondis).toBeCloseTo(0.08, 10);
    expect(b.lotsArrondis).toBeCloseTo(0.1, 10);
  });

  it("n'arrondit pas 0,30 lot à 0,29 à cause de la virgule flottante", () => {
    const r = tailleLots({ capital: 3000, risquePct: 1, stopPips: 10, valeurPipParLot: 10 });
    if ("erreur" in r) throw new Error(r.erreur);
    expect(r.lotsArrondis).toBeCloseTo(0.3, 10);
  });

  it("refuse les saisies impossibles", () => {
    expect(taillePositionPrix({ capital: 0, risquePct: 1, entree: 50, stop: 48 })).toHaveProperty("erreur");
    expect(taillePositionPrix({ capital: 1000, risquePct: 1, entree: 50, stop: 50 })).toHaveProperty("erreur");
    expect(tailleLots({ capital: 1000, risquePct: 150, stopPips: 10, valeurPipParLot: 10 })).toHaveProperty("erreur");
  });
});

describe("pips, lots, marge", () => {
  it("mesure les mouvements cités dans les cours", () => {
    expect(pipsEntre(1.085, 1.087, 0.0001)).toBe(20);
    expect(pipsEntre(1.264, 1.2615, 0.0001)).toBe(25);
    expect(pipsEntre(149.8, 150.3, 0.01)).toBe(50);
    expect(pipsEntre(1.08512, 1.085, 0.0001)).toBe(1.2);
  });

  it("donne 10 $ par pip pour un lot de EUR/USD", () => {
    expect(valeurPipParLot({ taillePip: 0.0001, tailleContrat: 100000, conversion: 1 })).toBeCloseTo(10, 10);
    expect(valeurPipParLot({ taillePip: 0.0001, tailleContrat: 50000, conversion: 1 })).toBeCloseTo(5, 10);
    expect(valeurPipParLot({ taillePip: 0.0001, tailleContrat: 100000, conversion: 1 / 1.085 })).toBeCloseTo(9.2166, 3);
  });

  it("calcule la marge et l'effet du levier", () => {
    expect(margeRequise(30000, 30)).toBe(1000);
    expect(margeRequise(20000, 20)).toBe(1000);
    expect(perteSurCapitalPct(30, 1)).toBe(30);
  });

  it("calcule le gain nécessaire pour effacer une baisse", () => {
    expect(gainPourRecuperer(0.2)).toBeCloseTo(0.25, 12);
    expect(gainPourRecuperer(0.47)).toBeCloseTo(0.8868, 3);
  });
});
