// Exporte le texte des capsules pour la synthèse vocale : une phrase affichée et sa version orale.
// Usage : npx tsx scripts/voix/exporter.ts <dossier de sortie> [dossier des minutages existants] [--prives]
// Avec --prives : capsules des modules payants (dossier prive/, hors dépôt public).
// Les capsules dont la narration existante est à jour (même empreinte) ne sont pas réexportées.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chapitresPublies } from "../../src/content";
import type { Chapitre } from "../../src/content/schema";
import { empreinteTextes, phrasesAffichees, texteOral } from "../../src/lib/narration";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const prives = process.argv.includes("--prives");
const sortie = args[0] ?? ".outils/voix/scripts";
const minutages = args[1];

async function main() {
  const chapitres: Chapitre[] = prives ? (await import(pathToFileURL(join(process.cwd(), "prive", "index.ts")).href)).chapitresPrives : chapitresPublies;

  rmSync(sortie, { recursive: true, force: true });
  mkdirSync(sortie, { recursive: true });
  let exportes = 0;
  for (const c of chapitres) {
    const textes = c.capsule.scenes.map((s) => s.texte);
    const empreinte = empreinteTextes(textes);
    const existant = minutages ? join(minutages, `${c.slug}.json`) : null;
    if (existant && existsSync(existant) && JSON.parse(readFileSync(existant, "utf8")).empreinte === empreinte) continue;
    const scenes = c.capsule.scenes.map((s) => ({
      phrases: phrasesAffichees(s.texte).map((affiche) => ({ affiche, oral: texteOral(affiche) })),
    }));
    writeFileSync(join(sortie, `${c.slug}.json`), JSON.stringify({ slug: c.slug, empreinte, scenes }, null, 2));
    exportes++;
  }
  console.log(`${exportes} scripts exportés dans ${sortie} (${chapitres.length - exportes} narrations déjà à jour)`);
}

void main();
