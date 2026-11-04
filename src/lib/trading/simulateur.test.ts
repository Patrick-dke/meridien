import { describe, expect, it } from "vitest";
import { convertir, formaterMontant, PARITE_FCFA } from "./devises";
import { avancer, enR, fermer, instrument, lotsPourRisque, marge, nouveauCompte, resultatCotation, serie, sortieSurBougie, versCompte, type Compte, type Position } from "./simulateur";

const taux = { EUR: 1, USD: 1.1, GBP: 0.85, JPY: 160, XAF: PARITE_FCFA, XOF: PARITE_FCFA, CAD: 1.5, CHF: 0.95 };

describe("devises", () => {
  it("convertit par l'euro, et refuse sans taux plutôt que d'inventer", () => {
    expect(convertir(655.957, "XAF", "EUR", taux)).toBeCloseTo(1, 9);
    expect(convertir(110, "USD", "XAF", taux)).toBeCloseTo(65_595.7, 6);
    expect(convertir(10, "USD", "GBP", { EUR: 1, USD: 1.1 })).toBeNull();
  });
  it("formate selon la devise (pas de décimales pour le FCFA et le yen)", () => {
    expect(formaterMontant(125000, "XAF")).toMatch(/125\s000\sFCFA/);
    expect(formaterMontant(1250.5, "USD")).toMatch(/1\s250,50/);
    expect(formaterMontant(15000, "JPY")).not.toMatch(/,/);
  });
});

describe("compte d'entraînement", () => {
  const eurusd = instrument("EUR/USD");
  const usdjpy = instrument("USD/JPY");
  const achat: Position = { id: "p", symbole: "EUR/USD", sens: "achat", lots: 0.5, entree: 1.08, stop: 1.078, objectif: 1.084, ouverteA: 60 };

  it("calcule le résultat dans la devise de cotation, puis dans celle du compte", () => {
    // 0,5 lot × 100 000 × 0,0040 = 200 USD
    expect(resultatCotation(achat, 1.084, eurusd)).toBeCloseTo(200, 6);
    expect(versCompte(200, eurusd, 1.084, "USD", taux)).toBe(200);
    // Compte en euros (devise de base) : le prix du couple sert de taux.
    expect(versCompte(200, eurusd, 1.084, "EUR", taux)).toBeCloseTo(184.5018, 3);
    // Compte en FCFA : conversion USD → EUR → XAF aux taux de référence.
    expect(versCompte(200, eurusd, 1.084, "XAF", taux)).toBeCloseTo((200 / 1.1) * PARITE_FCFA, 3);
    // Yen : 1 lot USD/JPY qui gagne 0,50 = 50 000 JPY, soit 50 000 / 150,5 USD pour un compte en dollars.
    expect(versCompte(resultatCotation({ sens: "achat", lots: 1, entree: 150 }, 150.5, usdjpy), usdjpy, 150.5, "USD", taux)).toBeCloseTo(50_000 / 150.5, 6);
  });

  it("exécute stop et objectif sur les mèches, au prix d'ouverture en cas d'écart, le stop d'abord si les deux", () => {
    expect(sortieSurBougie(achat, { o: 1.081, h: 1.085, l: 1.0805, c: 1.084 })).toEqual({ prix: 1.084, motif: "objectif" });
    expect(sortieSurBougie(achat, { o: 1.077, h: 1.079, l: 1.076, c: 1.078 })).toEqual({ prix: 1.077, motif: "stop" });
    expect(sortieSurBougie(achat, { o: 1.08, h: 1.085, l: 1.077, c: 1.08 })).toEqual({ prix: 1.078, motif: "stop" });
    expect(sortieSurBougie(achat, { o: 1.08, h: 1.081, l: 1.079, c: 1.0805 })).toBeNull();
  });

  it("met le solde à jour, en R comme en devise du compte, et calcule la marge", () => {
    const c = { ...nouveauCompte("USD", 10_000, 30, 1), positions: [achat] };
    const apres = fermer(c, achat, 1.084, "objectif", taux)!;
    expect(apres.solde).toBeCloseTo(10_200, 6);
    expect(apres.historique[0].resultatR).toBeCloseTo(2, 9);
    expect(enR(achat, 1.078)).toBeCloseTo(-1, 9);
    // 0,5 lot × 100 000 × 1,08 = 54 000 USD, levier 30 : 1 800 USD de marge.
    expect(marge(achat, 1.08, eurusd, "USD", 30, taux)).toBeCloseTo(1800, 6);
    // Compte en euros : 50 000 EUR de valeur, 1 666,67 EUR de marge.
    expect(marge(achat, 1.08, eurusd, "EUR", 30, taux)).toBeCloseTo(1666.667, 2);
  });

  it("dimensionne la position pour un risque donné", () => {
    // 1 % de 10 000 USD = 100 USD ; 0,0020 × 100 000 = 200 USD par lot → 0,5 lot.
    expect(lotsPourRisque({ solde: 10_000, risquePct: 1, entree: 1.08, stop: 1.078, i: eurusd, devise: "USD", taux })).toBe(0.5);
  });

  it("rejoue le marché et ferme les positions sur leur stop ou leur objectif", () => {
    const s = serie(eurusd, 42);
    let c: Compte = { ...nouveauCompte("USD", 10_000, 30, 42), positions: [{ ...achat, entree: s[60].c, stop: s[60].c - 0.002, objectif: s[60].c + 0.002 }] };
    for (let k = 0; k < 400 && c.positions.length; k++) c = avancer(c, { "EUR/USD": s }, taux).compte;
    expect(c.positions).toHaveLength(0);
    expect(Math.abs(c.solde - 10_000)).toBeGreaterThan(50);
    expect(["stop", "objectif"]).toContain(c.historique[0].motif);
  });
});
