import { describe, expect, it } from "vitest";
import {
  alea,
  cleQuestion,
  CONFIG_DEPART,
  corriger,
  lireConfig,
  ramener,
  tirerExamen,
  versionSansCorrige,
  type Candidate,
  type QuestionBanque,
} from "./regles";

const q = (id: string, difficulte: 1 | 2 | 3, extra: Partial<QuestionBanque> = {}): QuestionBanque => ({
  id,
  type: "unique",
  enonce: `Question ${id}`,
  explication: `Parce que ${id}.`,
  concepts: [`c-${id.slice(0, 2)}`],
  difficulte,
  choix: ["a", "b", "c"],
  bonne: 1,
  ...extra,
});

// Trois chapitres, quatre questions par niveau chacun.
const banque: Candidate[] = ["ch1", "ch2", "ch3"].flatMap((slug) =>
  ([1, 2, 3] as const).flatMap((d) => [0, 1, 2, 3].map((k) => ({ slug, q: q(`${slug}-${d}-${k}`, d) }))),
);
const parCle = new Map(banque.map((c) => [cleQuestion(c.slug, c.q.id), c.q]));

describe("examens de fin de module", () => {
  it("lit la configuration avec des bornes sûres", () => {
    expect(lireConfig(undefined)).toEqual(CONFIG_DEPART);
    expect(lireConfig({ seuil: 0.2, connaissance: 50, application: "4", transfert: -1 })).toMatchObject({
      seuil: 0.7,
      connaissance: 6,
      application: 4,
      transfert: 4,
    });
  });

  it("tire le bon nombre de questions par niveau, sans doublon, réparties sur les chapitres", () => {
    const t = tirerExamen(banque, CONFIG_DEPART, new Set(), alea(1));
    expect(t).toHaveLength(16);
    expect(new Set(t.map((x) => cleQuestion(x.slug, x.id))).size).toBe(16);
    expect(t.filter((x) => x.niveau === "connaissance")).toHaveLength(6);
    expect(t.filter((x) => x.niveau === "transfert")).toHaveLength(4);
    // Trié par niveau croissant.
    expect(t.map((x) => x.niveau)).toEqual([...Array(6).fill("connaissance"), ...Array(6).fill("application"), ...Array(4).fill("transfert")]);
    // Six questions de connaissance sur trois chapitres : deux par chapitre.
    for (const ch of ["ch1", "ch2", "ch3"]) expect(t.filter((x) => x.niveau === "connaissance" && x.slug === ch)).toHaveLength(2);
  });

  it("une reprise donne une variante : les questions déjà vues passent après les nouvelles", () => {
    const premiere = tirerExamen(banque, CONFIG_DEPART, new Set(), alea(7));
    const vues = new Set(premiere.map((x) => cleQuestion(x.slug, x.id)));
    const seconde = tirerExamen(banque, CONFIG_DEPART, vues, alea(8));
    // Douze questions par niveau dans la banque : la seconde tentative peut éviter toutes celles de connaissance et d'application.
    const communes = seconde.filter((x) => vues.has(cleQuestion(x.slug, x.id)) && x.niveau !== "transfert");
    expect(communes).toHaveLength(0);
  });

  it("complète un niveau trop pauvre avec les autres", () => {
    const pauvre = banque.filter((c) => c.q.difficulte !== 3);
    const t = tirerExamen(pauvre, CONFIG_DEPART, new Set(), alea(3));
    expect(t).toHaveLength(16);
    expect(t.some((x) => x.niveau === "transfert")).toBe(false);
  });

  it("n'envoie jamais le corrigé, et note juste après permutation des paires et des étapes", () => {
    const assoc = q("as-1", 2, {
      type: "association",
      paires: [
        ["a", "1"],
        ["b", "2"],
        ["c", "3"],
      ],
      choix: undefined,
      bonne: undefined,
    });
    const ordre = q("or-1", 2, { type: "ordre", etapes: ["un", "deux", "trois", "quatre"], choix: undefined, bonne: undefined });
    const unique = q("un-1", 1);
    const tA = { slug: "ch1", id: "as-1", niveau: "application" as const, perm: [2, 0, 1] };
    const tO = { slug: "ch1", id: "or-1", niveau: "application" as const, perm: [3, 1, 0, 2] };
    const tU = { slug: "ch1", id: "un-1", niveau: "connaissance" as const };

    const vu = versionSansCorrige(unique, tU);
    expect(vu).toMatchObject({ bonne: -1, explication: "" });
    expect(JSON.stringify(vu)).not.toContain("Parce que");
    const va = versionSansCorrige(assoc, tA) as unknown as { paires: string[][] };
    expect(va.paires).toEqual([
      ["a", "3"],
      ["b", "1"],
      ["c", "2"],
    ]);
    const vo = versionSansCorrige(ordre, tO) as unknown as { etapes: string[] };
    expect(vo.etapes).toEqual(["quatre", "deux", "un", "trois"]);

    // Réponses justes exprimées dans les positions affichées : « a » va avec « 1 », affiché en position 1, etc.
    const justeA = { type: "association", choix: [1, 2, 0] };
    expect(ramener(assoc, tA, justeA)).toEqual({ type: "association", choix: [0, 1, 2] });
    const justeO = { type: "ordre", ordre: [2, 1, 3, 0] };
    expect(ramener(ordre, tO, justeO)).toEqual({ type: "ordre", ordre: [0, 1, 2, 3] });

    const m = new Map([
      [cleQuestion("ch1", "as-1"), assoc],
      [cleQuestion("ch1", "or-1"), ordre],
      [cleQuestion("ch1", "un-1"), unique],
    ]);
    const r = corriger([tU, tA, tO], m, [{ type: "unique", choix: 1 }, justeA, justeO], 0.7);
    expect(r.score).toBe(1);
    expect(r.reussi).toBe(true);
    const faux = corriger(
      [tU, tA, tO],
      m,
      [
        { type: "unique", choix: 0 },
        { type: "association", choix: [0, 1, 2] },
        { type: "ordre", ordre: [0, 1, 2, 3] },
      ],
      0.7,
    );
    expect(faux.score).toBeLessThan(0.5);
    expect(faux.reussi).toBe(false);
    expect(faux.correction[0]).toMatchObject({ attendue: "b", explication: "Parce que un-1." });
    expect(faux.aRevoir[0].slug).toBe("ch1");
  });

  it("donne un score par niveau et désigne les chapitres à revoir", () => {
    const t = tirerExamen(banque, CONFIG_DEPART, new Set(), alea(5));
    // Juste partout sauf au chapitre 2.
    const reponses = t.map((x) => ({ type: "unique", choix: x.slug === "ch2" ? 0 : 1 }));
    const r = corriger(t, parCle, reponses, 0.7);
    expect(r.parNiveau.map((n) => n.questions)).toEqual([6, 6, 4]);
    expect(r.aRevoir.map((c) => c.slug)).toEqual(["ch2"]);
    expect(r.aRevoir[0].score).toBe(0);
  });
});
