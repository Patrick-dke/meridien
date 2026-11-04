// Exporte le texte des capsules pour la synthèse vocale : une phrase affichée et sa version orale.
// Usage : npx tsx scripts/voix/exporter.ts <dossier de sortie> [dossier des minutages existants] [--prives] [--module=<id>] [--voix=<id>]
// Avec --prives : capsules des modules payants (dossier prive/, hors dépôt public) ; --module en garde un seul.
// Les capsules dont la narration existante est à jour (même empreinte et, avec --voix, même voix) ne sont pas réexportées.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chapitresPublies } from "../../src/content";
import type { Chapitre } from "../../src/content/schema";
import { capsules } from "../../src/content/verifier";
import { empreinteTextes, identifiantNarration, phrasesAffichees, texteOral } from "../../src/lib/narration";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const prives = process.argv.includes("--prives");
const voix = process.argv.find((a) => a.startsWith("--voix="))?.slice("--voix=".length);
const unModule = process.argv.find((a) => a.startsWith("--module="))?.slice("--module=".length);
const sortie = args[0] ?? ".outils/voix/scripts";
const minutages = args[1];

async function main() {
  const prive = prives ? ((await import(pathToFileURL(join(process.cwd(), "prive", "index.ts")).href)) as { chapitresPrives: Chapitre[]; chapitresParModule: Record<string, Chapitre[]> }) : null;
  const chapitres: Chapitre[] = prive ? (unModule ? prive.chapitresParModule[unModule] : prive.chapitresPrives) : chapitresPublies;
  if (!chapitres) throw new Error(`Module inconnu : ${unModule}`);

  rmSync(sortie, { recursive: true, force: true });
  mkdirSync(sortie, { recursive: true });
  let exportes = 0;
  let total = 0;
  for (const c of chapitres) {
    for (const [k, capsule] of capsules(c).entries()) {
      total++;
      const slug = identifiantNarration(c.slug, k);
      const textes = capsule.scenes.map((s) => s.texte);
      const empreinte = empreinteTextes(textes);
      const existant = minutages ? join(minutages, `${slug}.json`) : null;
      if (existant && existsSync(existant)) {
        const n = JSON.parse(readFileSync(existant, "utf8")) as { empreinte: string; voix: string };
        if (n.empreinte === empreinte && (!voix || n.voix.includes(voix))) continue;
      }
      const scenes = capsule.scenes.map((s) => ({
        phrases: phrasesAffichees(s.texte).map((affiche) => ({ affiche, oral: texteOral(affiche) })),
      }));
      writeFileSync(join(sortie, `${slug}.json`), JSON.stringify({ slug, empreinte, scenes }, null, 2));
      exportes++;
    }
  }
  console.log(`${exportes} scripts exportés dans ${sortie} (${total - exportes} narrations déjà à jour)`);
}

void main();
