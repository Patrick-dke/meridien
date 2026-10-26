import { describe, expect, it } from "vitest";
import { executerOrdre } from "@/components/figures/Carnet";
import { concepts } from "@/content/concepts";
import type { Question } from "@/content/schema";
import { ETAT_VIDE, ajouterScoresConcepts, lireEtat, type Etat } from "../progression/etat";
import { decouper, typographie } from "../typographie";
import { etatConcept, maitrise, recommander } from "./maitrise";
import { melangeDeterministe, noter, noterQuiz, reponseVide } from "./quiz";

const q = {
  unique: { id: "u", type: "unique", enonce: "?", choix: ["a", "b", "c"], bonne: 1, explication: "e", concepts: ["pip"] },
  multiple: { id: "m", type: "multiple", enonce: "?", choix: ["a", "b", "c", "d"], bonnes: [0, 2], explication: "e", concepts: ["lot"] },
  vraifaux: { id: "v", type: "vraifaux", enonce: "?", reponse: false, explication: "e", concepts: ["pip"] },
  association: { id: "a", type: "association", enonce: "?", paires: [["1", "un"], ["2", "deux"], ["3", "trois"]], explication: "e", concepts: ["lot"] },
  ordre: { id: "o", type: "ordre", enonce: "?", etapes: ["a", "b", "c", "d"], explication: "e", concepts: ["pip"] },
} satisfies Record<string, Question>;

describe("notation des questions", () => {
  it("note une question à choix unique et un vrai/faux", () => {
    expect(noter(q.unique, { type: "unique", choix: 1 })).toBe(1);
    expect(noter(q.unique, { type: "unique", choix: 0 })).toBe(0);
    expect(noter(q.vraifaux, { type: "vraifaux", valeur: false })).toBe(1);
    expect(noter(q.vraifaux, { type: "vraifaux", valeur: true })).toBe(0);
  });

  it("donne un crédit partiel aux choix multiples, sans récompenser le « tout cocher »", () => {
    expect(noter(q.multiple, { type: "multiple", choix: [0, 2] })).toBe(1);
    expect(noter(q.multiple, { type: "multiple", choix: [0] })).toBe(0.5);
    expect(noter(q.multiple, { type: "multiple", choix: [0, 1, 2, 3] })).toBe(0);
  });

  it("note association et ordre par éléments justes", () => {
    expect(noter(q.association, { type: "association", choix: [0, 1, 2] })).toBe(1);
    expect(noter(q.association, { type: "association", choix: [1, 0, 2] })).toBeCloseTo(1 / 3, 12);
    expect(noter(q.ordre, { type: "ordre", ordre: [0, 1, 2, 3] })).toBe(1);
    expect(noter(q.ordre, { type: "ordre", ordre: [1, 0, 2, 3] })).toBe(0.5);
  });

  it("valide le quiz à partir de 80 % et calcule le score par concept", () => {
    const questions = [q.unique, q.multiple, q.vraifaux, q.association, q.ordre];
    const r = noterQuiz(questions, [
      { type: "unique", choix: 1 },
      { type: "multiple", choix: [0, 2] },
      { type: "vraifaux", valeur: false },
      { type: "association", choix: [0, 1, 2] },
      { type: "ordre", ordre: [1, 0, 2, 3] },
    ]);
    expect(r.score).toBeCloseTo(0.9, 12);
    expect(r.reussi).toBe(true);
    expect(r.parConcept.find((c) => c.concept === "pip")!.score).toBeCloseTo(2.5 / 3, 12);
  });

  it("ne présente jamais une question d'ordre déjà rangée", () => {
    for (const graine of ["c03-q5", "c07-q3", "c13-q5", "x", "y"]) {
      for (const n of [2, 3, 4, 5]) {
        const m = melangeDeterministe(n, graine);
        expect([...m].sort()).toEqual([...Array(n).keys()]);
        expect(m.every((v, i) => v === i)).toBe(false);
      }
    }
    const r = reponseVide(q.ordre);
    expect(r.type === "ordre" && r.ordre.length).toBe(4);
  });
});

describe("maîtrise et recommandations", () => {
  it("pondère davantage les résultats récents", () => {
    expect(maitrise([0, 1]).valeur).toBeGreaterThan(0.5);
    expect(maitrise([1, 0]).valeur).toBeLessThan(0.5);
    expect(maitrise([]).preuves).toBe(0);
  });

  it("classe les concepts selon les seuils du dossier", () => {
    expect(etatConcept([])).toBe("non-vu");
    expect(etatConcept([0, 0.5])).toBe("fragile");
    expect(etatConcept([1, 1])).toBe("acquis");
    expect(etatConcept([1])).toBe("en-cours");
  });

  it("recommande d'abord le prérequis fragile (R2), puis le chapitre du concept (R1)", () => {
    const etat: Etat = { ...ETAT_VIDE, concepts: { "valeur-pip": { scores: [0, 0], dernier: "" }, "taille-position": { scores: [0, 0.2], dernier: "" } } };
    const titres = new Map<string, string>();
    const recos = recommander(etat, concepts, ["quest-ce-que-le-trading"], titres);
    const r2 = recos.findIndex((r) => r.regle === "R2" && r.chapitre === "pips-points-lots");
    const r1 = recos.findIndex((r) => r.regle === "R1" && r.chapitre === "risque-et-taille-de-position");
    expect(r2).toBeGreaterThanOrEqual(0);
    expect(r1).toBeGreaterThan(r2);
  });

  it("propose la suite du parcours et relance après sept jours d'absence", () => {
    const etat: Etat = {
      ...ETAT_VIDE,
      chapitres: { a: { statut: "termine", etape: 9, debut: "", tempsS: 0, tentatives: 1 } },
      derniereVisite: "2026-10-01T10:00:00.000Z",
      dernierChapitre: "a",
    };
    const recos = recommander(etat, [], ["a", "b"], new Map(), new Date("2026-10-26T10:00:00.000Z"));
    expect(recos.map((r) => r.regle)).toEqual(["R6", "suite"]);
    expect(recos[1].chapitre).toBe("b");
  });
});

describe("progression enregistrée", () => {
  it("refuse un fichier d'un autre format", () => {
    expect(lireEtat("{}")).toBeNull();
    expect(lireEtat("pas du json")).toBeNull();
    expect(lireEtat(null)).toBeNull();
  });

  it("relit un état valide à l'identique", () => {
    const etat = ajouterScoresConcepts(ETAT_VIDE, [{ concept: "pip", score: 1 }], "2026-10-26");
    expect(lireEtat(JSON.stringify(etat))).toEqual(etat);
  });

  it("garde les 20 derniers scores par concept", () => {
    let etat = ETAT_VIDE;
    for (let i = 0; i < 25; i++) etat = ajouterScoresConcepts(etat, [{ concept: "pip", score: i % 2 }], "d");
    expect(etat.concepts.pip.scores).toHaveLength(20);
  });
});

describe("carnet d'ordres", () => {
  it("exécute 1 000 actions à un prix moyen de 50,03 €", () => {
    const ventes = [
      { prix: 50.02, quantite: 300 },
      { prix: 50.03, quantite: 450 },
      { prix: 50.04, quantite: 200 },
      { prix: 50.05, quantite: 600 },
    ];
    const r = executerOrdre(ventes, 1000);
    expect(r.pris).toEqual([300, 450, 200, 50]);
    expect(r.prixMoyen).toBeCloseTo(50.03, 10);
    expect(executerOrdre(ventes, 500).prixMoyen).toBeCloseTo(50.024, 10);
  });
});

describe("typographie", () => {
  it("découpe gras et termes du glossaire", () => {
    expect(decouper("Le [[spread|écart]] est **payé** ici.")).toEqual([
      { type: "texte", valeur: "Le " },
      { type: "terme", slug: "spread", valeur: "écart" },
      { type: "texte", valeur: " est " },
      { type: "gras", valeur: "payé" },
      { type: "texte", valeur: " ici." },
    ]);
  });

  it("pose les espaces insécables françaises", () => {
    expect(typographie("Prix : 50 € ; ok ? « oui »")).toBe("Prix : 50 € ; ok ? « oui »");
  });
});
