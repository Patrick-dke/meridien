// Résumé chiffré de chaque module de l'offre (durée, capsules, questions, exercices), affiché sur les pages
// publiques. Lit aussi les contenus payants (prive/, hors dépôt) : seuls ces totaux sont publiés, jamais le contenu.
// Usage : npm run contenus:resume (à relancer après toute modification d'un chapitre).
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chapitresPublies } from "../../src/content";
import { offre } from "../../src/content/offre";
import type { Chapitre } from "../../src/content/schema";

async function main() {
  // Chemin calculé : prive/ est absent du dépôt, et donc de la vérification des types en intégration continue.
  const { chapitresPrives } = (await import(pathToFileURL(join(process.cwd(), "prive", "index.ts")).href)) as { chapitresPrives: Chapitre[] };
  const tous = new Map([...chapitresPublies, ...chapitresPrives].map((c) => [c.slug, c]));
  const resume: Record<string, { chapitres: number; dureeMin: number; capsules: number; questions: number; exercices: number }> = {};
  for (const m of offre) {
    const cs = m.chapitres.map((s) => tous.get(s)).filter((c): c is Chapitre => Boolean(c));
    if (cs.length !== m.chapitres.length) throw new Error(`${m.id} : ${m.chapitres.length - cs.length} chapitre(s) introuvable(s)`);
    resume[m.id] = {
      chapitres: cs.length,
      dureeMin: cs.reduce((a, c) => a + c.dureeMin, 0),
      capsules: cs.reduce((a, c) => a + 1 + (c.capsulesSupplementaires?.length ?? 0), 0),
      questions: cs.reduce((a, c) => a + c.quiz.length, 0),
      exercices: cs.reduce((a, c) => a + (c.exercices?.length ?? 0), 0),
    };
  }
  writeFileSync("src/content/resume-offre.json", `${JSON.stringify(resume, null, 2)}\n`);
  console.log(resume);
}

void main();
