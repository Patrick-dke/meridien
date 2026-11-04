import { describe, expect, it } from "vitest";
import { rEntree, statistiques, versCsv, type EntreeJournal } from "./journal";

const t = (date: string, resultat: number, r: number | null = null): EntreeJournal => ({
  id: date,
  date,
  symbole: "EUR/USD",
  sens: "achat",
  entree: 1,
  sortie: 1,
  resultat,
  devise: "USD",
  r,
  source: "manuel",
});

describe("journal de trading", () => {
  it("calcule le R d'un trade", () => {
    expect(rEntree({ sens: "achat", entree: 100, stop: 98, sortie: 106 })).toBe(3);
    expect(rEntree({ sens: "vente", entree: 100, stop: 102, sortie: 101 })).toBe(-0.5);
    expect(rEntree({ sens: "achat", entree: 100, sortie: 106 })).toBeNull();
  });

  it("calcule espérance, facteur de profit, drawdown et pire série", () => {
    const s = statistiques([t("2026-01-01", 200, 2), t("2026-01-02", -100, -1), t("2026-01-03", -100, -1), t("2026-01-04", -100, -1), t("2026-01-05", 300, 3)], 1000)!;
    expect(s.nombre).toBe(5);
    expect(s.tauxReussite).toBeCloseTo(0.4, 9);
    expect(s.esperance).toBeCloseTo(40, 9);
    expect(s.facteurProfit).toBeCloseTo(500 / 300, 9);
    expect(s.drawdownMax).toBe(300);
    expect(s.pireSerie).toBe(3);
    expect(s.totalR).toBe(2);
    expect(s.courbe).toEqual([1000, 1200, 1100, 1000, 900, 1200]);
  });

  it("exporte en CSV en protégeant les champs", () => {
    const csv = versCsv([{ ...t("2026-01-01", 12.5), notes: 'stop "trop" serré; à revoir' }]);
    expect(csv.split("\n")[1]).toContain('"stop ""trop"" serré; à revoir"');
  });
});
