// Prépare les fichiers à publier depuis Administration → Contenus (ils restent dans prive/, hors dépôt public).
// Usage : npm run contenus:preparer
// La publication est découpée en parties de moins de 9 Mo : chacune s'envoie vite, même sur une connexion lente, et
// l'administration reprend là où elle s'est arrêtée si l'envoi est coupé.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { preparerPublication } from "./publication";

const TAILLE_MAX = 9_000_000;

async function main() {
  const p = await preparerPublication();
  const dossier = join("prive", "publication");
  mkdirSync(dossier, { recursive: true });
  // Les fichiers d'une préparation précédente ne doivent pas être envoyés avec ceux-ci.
  for (const f of readdirSync(dossier)) if (/^publication-.*\.json$/.test(f)) rmSync(join(dossier, f));

  type Partie = { version: string; contenus: typeof p.contenus; corriges: typeof p.corriges; narrations: typeof p.narrations };
  const parties: Partie[] = [];
  let partie: Partie | null = null;
  let taille = 0;
  const elements = [
    ...p.contenus.map((e) => ["contenus", e] as const),
    ...p.corriges.map((e) => ["corriges", e] as const),
    ...p.narrations.map((e) => ["narrations", e] as const),
  ];
  for (const [genre, e] of elements) {
    const t = Buffer.byteLength(JSON.stringify(e));
    if (t > TAILLE_MAX) console.warn(`! ${genre}/${e.slug} pèse ${(t / 1e6).toFixed(1)} Mo à lui seul`);
    if (!partie || taille + t > TAILLE_MAX) {
      partie = { version: p.version, contenus: [], corriges: [], narrations: [] };
      parties.push(partie);
      taille = 0;
    }
    (partie[genre] as unknown[]).push(e);
    taille += t;
  }
  const chiffres = String(parties.length).length;
  for (const [i, x] of parties.entries()) {
    const nom = `publication-${p.version}-partie-${String(i + 1).padStart(chiffres, "0")}-sur-${parties.length}.json`;
    writeFileSync(join(dossier, nom), JSON.stringify(x));
  }
  for (const a of p.avertissements) console.warn(`! ${a}`);
  console.log(`${p.contenus.length} chapitres, ${p.corriges.length} corrigés, ${p.narrations.length} narrations → ${parties.length} parties dans ${dossier}`);
}

void main();
