// Contrôle de fuite : aucun texte ni aucune scène des chapitres payants ne doit se trouver dans le site exporté.
// Usage (après npm run build, avec le dossier prive/) : npm run verifier:fuites [dossier, out par défaut]
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Chapitre } from "../../src/content/schema";

async function main() {
  const dossier = process.argv[2] ?? "out";
  const prive = (await import(pathToFileURL(join(process.cwd(), "prive", "index.ts")).href)) as { chapitresPrives: Chapitre[]; scenesPrivees: Record<string, { description?: string; bougies?: unknown[] }> };
  const publics = (await import(pathToFileURL(join(process.cwd(), "src", "content", "index.ts")).href)) as { tousLesChapitres: Chapitre[] };
  // Un texte présent aussi dans un chapitre gratuit (question reprise, par exemple) n'est pas une fuite.
  const textePublic = JSON.stringify(publics.tousLesChapitres);
  const fichiers: string[] = [];
  const parcourir = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) parcourir(p);
      else if (/\.(html|js|txt|json|css|xml)$/.test(f)) fichiers.push(p);
    }
  };
  parcourir(dossier);
  const tout = fichiers.map((f) => readFileSync(f, "utf8")).join("\n");
  const fuites: string[] = [];
  for (const c of prive.chapitresPrives) {
    const extraits = [c.intro, c.capsule.scenes[0].texte, c.resume[0], c.quiz[0].enonce, c.exercices[0].consigne, c.erreurs[0].texte].map((t) => t.slice(0, 50));
    for (const e of extraits) if (tout.includes(e) && !textePublic.includes(e)) fuites.push(`${c.slug} : « ${e} »`);
  }
  // Les identifiants de scènes peuvent coïncider avec des identifiants de concepts publics : on cherche leurs données.
  const scenes = Object.entries(prive.scenesPrivees)
    .filter(([, s]) => (s.description && tout.includes(s.description.slice(0, 60))) || (s.bougies && tout.includes(JSON.stringify(s.bougies.slice(0, 3)).slice(1, -1))))
    .map(([id]) => id);
  console.log(`${fichiers.length} fichiers publiés, ${prive.chapitresPrives.length} chapitres payants contrôlés (6 extraits chacun).`);
  for (const f of [...fuites, ...scenes.map((s) => `scène ${s}`)]) console.error(`FUITE ${f}`);
  if (fuites.length || scenes.length) process.exit(1);
  console.log("Aucune fuite : le contenu payant n'est pas dans le site publié.");
}

void main();
