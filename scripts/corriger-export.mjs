// Après `next build` : Next 16 range les données de préchargement d'une page dans des sous-dossiers
// (academies/__next.academies/__PAGE__.txt) alors que le navigateur les demande sous un nom aplati
// (academies/__next.academies.__PAGE__.txt). Sans copie au nom attendu, chaque préchargement de lien
// finit en erreur 404 sur un hébergement statique. Ce script crée ces copies.
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const racine = "out";
let copies = 0;

function fichiers(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    return statSync(chemin).isDirectory() ? fichiers(chemin) : [chemin];
  });
}

function parcourir(dossier) {
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (!statSync(chemin).isDirectory()) continue;
    if (nom.startsWith("__next.")) {
      for (const f of fichiers(chemin)) {
        const aplati = join(dossier, `${nom}.${relative(chemin, f).split(sep).join(".")}`);
        if (!existsSync(aplati)) {
          copyFileSync(f, aplati);
          copies++;
        }
      }
    } else {
      parcourir(chemin);
    }
  }
}

if (!existsSync(racine)) throw new Error("Dossier out/ introuvable : lancez d'abord next build.");
parcourir(racine);
console.log(`Export corrigé : ${copies} fichier(s) de préchargement copiés sous leur nom aplati.`);
