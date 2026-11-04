import { describe, expect, it } from "vitest";
import type { Question } from "@/content/schema";
import { estVisuelle, noter, ordreAffichage, tirerQuestions } from "./quiz";

const q = (id: string, extra: Partial<Question> & Record<string, unknown> = {}): Question =>
  ({ id, type: "unique", enonce: id, explication: "x", concepts: ["a"], choix: ["v", "f"], bonne: 0, ...extra }) as Question;

const banque: Question[] = [
  q("q1", { concepts: ["a"], difficulte: 1 }),
  q("q2", { concepts: ["b"], difficulte: 3 }),
  q("q3", { concepts: ["c"] }),
  q("q4", { concepts: ["a"], figure: { scene: "s" } }),
  q("q5", { type: "graphique", scene: "s", bonnes: [3, 4], concepts: ["b"] }),
  q("q6", { type: "comparaison", graphiques: [{ scene: "s" }, { scene: "t" }], bonne: 1, concepts: ["c"] }),
  q("q7", { concepts: ["d"] }),
  q("q8", { concepts: ["a"] }),
  q("q9", { concepts: ["b"], difficulte: 1 }),
  q("q10", { concepts: ["c"], difficulte: 3 }),
];

describe("tirage des questions dans la banque", () => {
  it("tire la taille demandée, sans doublon, avec au moins deux questions visuelles et tous les concepts", () => {
    for (let graine = 1; graine < 200; graine++) {
      const serie = tirerQuestions(banque, 6, graine);
      expect(serie).toHaveLength(6);
      expect(new Set(serie.map((x) => x.id)).size).toBe(6);
      expect(serie.filter(estVisuelle).length).toBeGreaterThanOrEqual(2);
      expect(new Set(serie.flatMap((x) => x.concepts))).toEqual(new Set(["a", "b", "c", "d"]));
      const difficultes = serie.map((x) => x.difficulte ?? 2);
      expect(difficultes).toEqual([...difficultes].sort());
    }
  });

  it("varie d'une tentative à l'autre et se rejoue à l'identique avec la même graine", () => {
    const series = new Set(Array.from({ length: 30 }, (_, g) => tirerQuestions(banque, 6, g + 1).map((x) => x.id).join(",")));
    expect(series.size).toBeGreaterThan(5);
    expect(tirerQuestions(banque, 6, 42)).toEqual(tirerQuestions(banque, 6, 42));
  });

  it("mélange l'ordre des choix sans perdre de choix", () => {
    const ordres = new Set(Array.from({ length: 20 }, (_, g) => ordreAffichage(4, g, "q1").join("")));
    expect(ordres.size).toBeGreaterThan(3);
    for (const o of ordres) expect([...o].map(Number).sort()).toEqual([0, 1, 2, 3]);
  });
});

describe("notation des questions visuelles", () => {
  it("graphique : crédit partiel, jamais négatif", () => {
    expect(noter(banque[4], { type: "graphique", choix: [3, 4] })).toBe(1);
    expect(noter(banque[4], { type: "graphique", choix: [3] })).toBe(0.5);
    expect(noter(banque[4], { type: "graphique", choix: [3, 7] })).toBe(0);
    expect(noter(banque[4], { type: "graphique", choix: [1, 2, 5] })).toBe(0);
  });
  it("comparaison : juste seulement sur le bon graphique", () => {
    expect(noter(banque[5], { type: "comparaison", choix: 1 })).toBe(1);
    expect(noter(banque[5], { type: "comparaison", choix: 0 })).toBe(0);
  });
});
