import { describe, expect, it } from "vitest";
import type { SceneFigure } from "@/lib/chartkit/types";
import { academies } from "./catalogue";
import { concepts } from "./concepts";
import { glossaire } from "./glossaire";
import { offre } from "./offre";
import { scenes as scenesPubliques } from "./scenes";
import type { Chapitre } from "./schema";
import { problemesChapitre } from "./verifier";

// Les contenus payants vivent hors du dépôt public (dossier prive/) : ces tests ne tournent que là où ils existent.
const trouves = import.meta.glob("../../prive/index.ts", { eager: true }) as Record<
  string,
  { chapitresParModule: Record<string, Chapitre[]>; scenesPrivees: Record<string, SceneFigure> }
>;
const prive = Object.values(trouves)[0];
// LOT=<module> limite la vérification à un module (pratique pendant la rédaction).
const lot = process.env.LOT;

describe.skipIf(!prive)("contenus des modules payants", () => {
  const ctx = {
    slugsCatalogue: new Set(academies.flatMap((a) => a.modules.flatMap((m) => m.chapitres.map((c) => c.slug)))),
    idsConcepts: new Set(concepts.map((c) => c.id)),
    slugsGlossaire: new Set(glossaire.map((t) => t.slug)),
    scenes: { ...scenesPubliques, ...(prive?.scenesPrivees ?? {}) },
  };
  const modules = Object.entries(prive?.chapitresParModule ?? {}).filter(([m]) => !lot || m === lot);

  for (const [id, chapitres] of modules) {
    describe(id, () => {
      const prevu = offre.find((m) => m.id === id)!;

      it("chaque chapitre est correct (schéma, concepts, glossaire, scènes, quiz, exercices, capsule)", () => {
        const bilan = Object.fromEntries(chapitres.map((c) => [c.slug, problemesChapitre(c, ctx)]).filter(([, p]) => (p as string[]).length));
        expect(bilan).toEqual({});
      });

      it("ses chapitres appartiennent au module, dans l'ordre, sans doublon", () => {
        const slugs = chapitres.map((c) => c.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
        for (const s of slugs) expect(prevu.chapitres, s).toContain(s);
        expect(slugs).toEqual(prevu.chapitres.filter((s) => slugs.includes(s)));
      });

      it("ses identifiants de quiz et d'exercices sont uniques dans tout le module", () => {
        const ids = chapitres.flatMap((c) => [...c.quiz.map((q) => q.id), ...c.exercices.map((e) => e.id)]);
        expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
      });
    });
  }

  it("aucune scène privée ne remplace une scène publique", () => {
    for (const s of Object.keys(prive?.scenesPrivees ?? {})) expect(scenesPubliques[s], s).toBeUndefined();
  });
});
