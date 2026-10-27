import { describe, expect, it } from "vitest";
import { ETAT_VIDE, fusionnerEtats, lireEtat, type Etat } from "./etat";

const base = (e: Partial<Etat>): Etat => ({ ...ETAT_VIDE, ...e });

describe("fusion de la progression locale avec celle du compte", () => {
  it("ne perd aucun chapitre ni aucune réussite", () => {
    const local = base({
      chapitres: { a: { statut: "termine", etape: 9, debut: "2026-10-01", fin: "2026-10-02", tempsS: 600, tentatives: 2, meilleurScore: 0.9 } },
      favoris: ["a"],
      notes: { a: "note locale" },
      journal: { "2026-10-02": 600 },
    });
    const compte = base({
      chapitres: {
        a: { statut: "en-cours", etape: 3, debut: "2026-09-20", tempsS: 900, tentatives: 1, meilleurScore: 0.5 },
        b: { statut: "en-cours", etape: 1, debut: "2026-09-21", tempsS: 60, tentatives: 0 },
      },
      favoris: ["b"],
      notes: { b: "note du compte" },
      journal: { "2026-10-02": 300, "2026-09-21": 60 },
    });
    const f = fusionnerEtats(local, compte);
    expect(f.chapitres.a).toMatchObject({ statut: "termine", etape: 9, debut: "2026-09-20", tempsS: 900, tentatives: 2, meilleurScore: 0.9 });
    expect(f.chapitres.b.etape).toBe(1);
    expect(f.favoris.sort()).toEqual(["a", "b"]);
    expect(f.notes).toEqual({ a: "note locale", b: "note du compte" });
    expect(f.journal).toEqual({ "2026-10-02": 600, "2026-09-21": 60 });
    expect(lireEtat(JSON.stringify(f))).not.toBeNull();
  });

  it("réunit deux notes différentes sur le même chapitre au lieu d'en écraser une", () => {
    const f = fusionnerEtats(base({ notes: { a: "sur le téléphone" } }), base({ notes: { a: "sur l'ordinateur" } }));
    expect(f.notes.a).toContain("sur le téléphone");
    expect(f.notes.a).toContain("sur l'ordinateur");
  });

  it("est stable : fusionner deux fois donne le même résultat", () => {
    const local = base({ chapitres: { a: { statut: "en-cours", etape: 2, debut: "2026-10-01", tempsS: 10, tentatives: 0 } }, notes: { a: "x" } });
    const compte = base({ notes: { a: "y" } });
    const une = fusionnerEtats(local, compte);
    expect(fusionnerEtats(une, une)).toEqual(une);
  });
});
