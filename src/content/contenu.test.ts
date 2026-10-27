import { problemesChapitre } from "./verifier";
import { moduleDuChapitre } from "./offre";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { bougieValide } from "@/lib/chartkit/outils";
import { empreinteTextes, phrasesAffichees, texteOral } from "@/lib/narration";
import { narration } from "./narrations";
import { decouper, texteBrut } from "@/lib/typographie";
import { academies, parcoursPremiersPas } from "./catalogue";
import { concepts } from "./concepts";
import { glossaire } from "./glossaire";
import { chapitresPublies, tousLesChapitres } from "./index";
import { scenes } from "./scenes";
import { Chapitre, Concept, Terme, type Bloc } from "./schema";

const slugsCatalogue = new Set(academies.flatMap((a) => a.modules.flatMap((m) => m.chapitres.map((c) => c.slug))));
const idsConcepts = new Set(concepts.map((c) => c.id));
const slugsGlossaire = new Set(glossaire.map((t) => t.slug));

/** Tous les textes d'un chapitre où la syntaxe [[terme]] et **gras** est permise. */
function textes(c: Chapitre): string[] {
  const deBlocs = (blocs: Bloc[]): string[] =>
    blocs.flatMap((b) => {
      if (b.type === "p" || b.type === "encadre" || b.type === "formule") return [b.texte];
      if (b.type === "liste") return b.items;
      if (b.type === "tableau") return b.lignes.flat();
      return [];
    });
  return [
    ...c.cours.flatMap((s) => deBlocs(s.blocs)),
    ...deBlocs(c.illustrations),
    ...(c.exemple ? deBlocs(c.exemple.blocs) : []),
    ...c.erreurs.map((e) => e.texte),
    ...c.resume,
  ];
}

function scenesUtilisees(c: Chapitre): string[] {
  const deBlocs = (blocs: Bloc[]) => blocs.flatMap((b) => (b.type === "figure" ? [b.scene] : []));
  return [
    ...c.cours.flatMap((s) => deBlocs(s.blocs)),
    ...deBlocs(c.illustrations),
    ...(c.exemple ? deBlocs(c.exemple.blocs) : []),
    ...c.capsule.scenes.flatMap((s) => (s.visuel.type === "figure" ? [s.visuel.scene] : [])),
  ];
}

describe("chapitres", () => {
  it("sont tous conformes au schéma", () => {
    for (const c of tousLesChapitres) expect(() => Chapitre.parse(c), c.slug).not.toThrow();
  });

  it("ont des slugs uniques, présents dans le catalogue", () => {
    const slugs = tousLesChapitres.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(slugsCatalogue.has(s), s).toBe(true);
  });

  it("couvrent tout le parcours « Premiers pas » avec des chapitres publiés", () => {
    expect(parcoursPremiersPas).toHaveLength(14);
    for (const s of parcoursPremiersPas) expect(chapitresPublies.some((c) => c.slug === s), s).toBe(true);
  });

  it("ne citent que des concepts connus", () => {
    for (const c of tousLesChapitres) {
      for (const id of [...c.concepts, ...c.prerequis, ...c.quiz.flatMap((q) => q.concepts)]) {
        expect(idsConcepts.has(id), `${c.slug} → ${id}`).toBe(true);
      }
    }
  });

  it("ne citent que des termes présents dans le glossaire", () => {
    for (const c of tousLesChapitres) {
      for (const t of textes(c)) {
        for (const s of decouper(t)) if (s.type === "terme") expect(slugsGlossaire.has(s.slug), `${c.slug} → ${s.slug}`).toBe(true);
      }
    }
  });

  it("n'utilisent que des scènes existantes", () => {
    for (const c of tousLesChapitres) for (const s of scenesUtilisees(c)) expect(scenes[s], `${c.slug} → ${s}`).toBeDefined();
  });

  it("ont des quiz cohérents", () => {
    for (const c of tousLesChapitres) {
      const ids = c.quiz.map((q) => q.id);
      expect(new Set(ids).size, c.slug).toBe(ids.length);
      for (const q of c.quiz) {
        if (q.type === "unique") expect(q.bonne).toBeLessThan(q.choix.length);
        if (q.type === "multiple") {
          expect(new Set(q.bonnes).size).toBe(q.bonnes.length);
          expect(q.bonnes.every((b) => b < q.choix.length)).toBe(true);
          expect(q.bonnes.length).toBeLessThan(q.choix.length);
        }
        if (q.type === "association") expect(new Set(q.paires.map((p) => p[1])).size, q.id).toBe(q.paires.length);
        if (q.type === "ordre") expect(new Set(q.etapes).size, q.id).toBe(q.etapes.length);
      }
    }
  });

  it("passent le vérificateur commun aux contenus gratuits et payants (exercices compris)", () => {
    const ctx = { slugsCatalogue, idsConcepts, slugsGlossaire, scenes };
    const bilan = Object.fromEntries(tousLesChapitres.map((c) => [c.slug, problemesChapitre(c, ctx)]).filter(([, p]) => (p as string[]).length));
    expect(bilan).toEqual({});
  });

  it("ont des capsules de 30 à 90 secondes, à un débit lisible", () => {
    for (const c of tousLesChapitres) {
      const duree = c.capsule.scenes.reduce((a, s) => a + s.duree, 0);
      expect(duree, c.slug).toBeGreaterThanOrEqual(30);
      expect(duree, c.slug).toBeLessThanOrEqual(90);
      for (const s of c.capsule.scenes) {
        const mots = texteBrut(s.texte).split(/\s+/).filter(Boolean).length;
        // Au plus 190 mots par minute : le texte doit pouvoir être lu, puis dit, dans la durée de la scène.
        expect(mots / s.duree, `${c.slug} : « ${s.texte} »`).toBeLessThanOrEqual(190 / 60);
      }
    }
  });
});

describe("narration des capsules", () => {
  it("chaque capsule publiée a une narration à jour, de 90 secondes au plus", () => {
    for (const c of chapitresPublies) {
      const n = narration(c.slug);
      expect(n, `${c.slug} : narration absente (npm run voix)`).not.toBeNull();
      if (!n) continue;
      // Un texte modifié sans régénérer la voix ferait dire autre chose que ce qui est affiché.
      expect(n.empreinte, `${c.slug} : narration périmée (npm run voix)`).toBe(empreinteTextes(c.capsule.scenes.map((s) => s.texte)));
      expect(n.scenes).toHaveLength(c.capsule.scenes.length);
      expect(n.duree, c.slug).toBeLessThanOrEqual(90);
      expect(n.duree, c.slug).toBeGreaterThanOrEqual(25);
      n.scenes.forEach((s, i) => {
        expect(s.phrases.map((p) => p.texte), `${c.slug}, scène ${i + 1}`).toEqual(phrasesAffichees(c.capsule.scenes[i].texte));
        expect(s.fin, `${c.slug}, scène ${i + 1}`).toBeGreaterThan(s.debut);
        if (i > 0) expect(s.debut).toBeCloseTo(n.scenes[i - 1].fin, 3);
        for (const p of s.phrases) {
          expect(p.debut).toBeGreaterThanOrEqual(s.debut);
          expect(p.fin).toBeLessThanOrEqual(s.fin);
        }
      });
      const fichier = join(process.cwd(), "public", n.audio);
      expect(existsSync(fichier), `${c.slug} : ${n.audio} manquant`).toBe(true);
      // MP3 mono à 48 kbit/s : environ 6 Ko par seconde ; un fichier bien plus petit serait tronqué ou silencieux.
      expect(statSync(fichier).size, c.slug).toBeGreaterThan(n.duree * 4000);
    }
  });

  it("dit les nombres comme on les prononce", () => {
    expect(texteOral("Tu risques 2,20 euros par action")).toBe("Tu risques 2 euros 20 par action");
    expect(texteOral("un levier de 1:30 et 1,5 % du capital")).toBe("un levier de 1 pour 30 et 1 virgule 5 pour cent du capital");
    expect(texteOral("10 000 € de capital")).toBe("10000 euros de capital");
    expect(texteOral("Étape 1 : 50 euros")).toBe("Étape 1 : 50 euros");
  });
});

describe("concepts et glossaire", () => {
  it("chaque concept renvoie à un chapitre du catalogue (gratuit et publié, ou payant) et à des prérequis connus", () => {
    for (const c of concepts) {
      expect(() => Concept.parse(c)).not.toThrow();
      const gratuit = chapitresPublies.some((ch) => ch.slug === c.chapitre);
      expect(gratuit || Boolean(moduleDuChapitre(c.chapitre)), c.id).toBe(true);
      for (const p of c.prerequis) expect(idsConcepts.has(p), `${c.id} → ${p}`).toBe(true);
    }
  });

  it("chaque terme est valide, unique et ses renvois existent", () => {
    expect(slugsGlossaire.size).toBe(glossaire.length);
    for (const t of glossaire) {
      expect(() => Terme.parse(t)).not.toThrow();
      for (const v of t.voirAussi) expect(slugsGlossaire.has(v), `${t.slug} → ${v}`).toBe(true);
      if (t.chapitre) expect(slugsCatalogue.has(t.chapitre), `${t.slug} → ${t.chapitre}`).toBe(true);
    }
  });
});

describe("scènes de prix", () => {
  it("ne contiennent que des bougies cohérentes", () => {
    for (const [id, s] of Object.entries(scenes)) {
      if (s.kind === "bougies" || s.kind === "unites-de-temps") {
        for (const b of s.bougies) expect(bougieValide(b), `${id} ${JSON.stringify(b)}`).toBe(true);
      }
    }
  });

  it("illustrent correctement le plan stop loss / take profit", () => {
    const s = scenes["sl-tp-achat"];
    if (s.kind !== "bougies") throw new Error("type de scène inattendu");
    const apresEntree = s.bougies.slice(8);
    expect(s.bougies[7].c).toBe(50);
    expect(Math.min(...apresEntree.map((b) => b.l))).toBeGreaterThan(47.8);
    // L'objectif n'est atteint qu'à la dernière bougie.
    expect(apresEntree.slice(0, -1).every((b) => b.h < 54.4)).toBe(true);
    expect(apresEntree.at(-1)!.h).toBeGreaterThanOrEqual(54.4);
  });

  it("montrent un gap qui saute par-dessus le stop", () => {
    const s = scenes["gap-stop"];
    if (s.kind !== "bougies") throw new Error("type de scène inattendu");
    expect(s.bougies[7].l).toBeGreaterThan(47.8);
    expect(s.bougies[8].o).toBeLessThan(47.8);
    expect(s.bougies[8].o).toBe(46.9);
  });
});

describe("chiffres cités dans les cours", () => {
  it("le tableau des séries de pertes du chapitre 13 est exact", () => {
    const c = tousLesChapitres.find((ch) => ch.slug === "risque-et-taille-de-position")!;
    const tableau = c.cours.flatMap((s) => s.blocs).find((b) => b.type === "tableau" && b.entetes[0] === "Pertes d'affilée");
    if (!tableau || tableau.type !== "tableau") throw new Error("tableau introuvable");
    const pct = (x: number) => `${(x * 100).toFixed(1).replace(".", ",")} %`;
    for (const ligne of tableau.lignes) {
      const n = Number(ligne[0]);
      expect(ligne.slice(1)).toEqual([pct(0.99 ** n), pct(0.95 ** n), pct(0.9 ** n)]);
    }
  });
});
