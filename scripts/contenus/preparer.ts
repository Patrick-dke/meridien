// Prépare le fichier à publier depuis Administration → Contenus (il reste dans prive/, hors dépôt public).
// Usage : npm run contenus:preparer
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { preparerPublication } from "./publication";

async function main() {
  const p = await preparerPublication();
  const dossier = join("prive", "publication");
  mkdirSync(dossier, { recursive: true });
  const fichier = join(dossier, `publication-${p.version}.json`);
  const { avertissements, ...contenu } = p;
  writeFileSync(fichier, JSON.stringify(contenu));
  for (const a of avertissements) console.warn(`! ${a}`);
  console.log(`${p.contenus.length} chapitres, ${p.corriges.length} corrigés, ${p.narrations.length} narrations → ${fichier}`);
}

void main();
