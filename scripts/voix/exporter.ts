// Exporte le texte des capsules publiées pour la synthèse vocale : une phrase affichée et sa version orale.
// Usage : npx tsx scripts/voix/exporter.ts <dossier de sortie>
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chapitresPublies } from "../../src/content";
import { empreinteTextes, phrasesAffichees, texteOral } from "../../src/lib/narration";

const sortie = process.argv[2] ?? ".outils/voix/scripts";
mkdirSync(sortie, { recursive: true });

for (const c of chapitresPublies) {
  const textes = c.capsule.scenes.map((s) => s.texte);
  const scenes = c.capsule.scenes.map((s) => ({
    phrases: phrasesAffichees(s.texte).map((affiche) => ({ affiche, oral: texteOral(affiche) })),
  }));
  writeFileSync(join(sortie, `${c.slug}.json`), JSON.stringify({ slug: c.slug, empreinte: empreinteTextes(textes), scenes }, null, 2));
}
console.log(`${chapitresPublies.length} scripts exportés dans ${sortie}`);
