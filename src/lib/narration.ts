import { texteBrut } from "./typographie";

/** Minutage d'une capsule narrée, produit par scripts/voix (une entrée par scène, une par phrase). */
export type Phrase = { debut: number; fin: number; texte: string };
export type SceneNarree = { debut: number; fin: number; phrases: Phrase[] };
export type Narration = {
  slug: string;
  voix: string;
  /** Empreinte des textes narrés : si un texte change, la narration doit être régénérée. */
  empreinte: string;
  duree: number;
  audio: string;
  scenes: SceneNarree[];
};

/** Découpe un texte de scène en phrases affichables, coupées aux fins de phrase ; les très longues, aux deux-points. */
export function phrasesAffichees(texte: string): string[] {
  const brut = texteBrut(texte).replace(/\s+/g, " ").trim();
  const phrases = brut.match(/[^.!?…]+(?:[.!?…]+|$)/g)?.map((p) => p.trim()).filter(Boolean) ?? [brut];
  return phrases.flatMap((p) => {
    if (p.length <= 110) return [p];
    const coupe = p.search(/ ?[:;] /);
    return coupe > 30 && coupe < p.length - 20 ? [p.slice(0, coupe + 2).trim(), p.slice(coupe + 2).trim()] : [p];
  });
}

/** Texte prononcé : nombres, unités et symboles écrits comme on les dit, pour la synthèse vocale. */
export function texteOral(affiche: string): string {
  return (
    affiche
      // Espaces de groupes de chiffres (10 000 → 10000) et espaces insécables.
      .replace(/(\d)[   ](?=\d{3}\b)/g, "$1")
      .replace(/[  ]/g, " ")
      // Montants : 2,20 euros → 2 euros 20 ; 47,80 € → 47 euros 80.
      .replace(/(\d+),(\d{2}) ?(?:euros?|€)/g, "$1 euros $2")
      .replace(/(\d+) ?€/g, "$1 euros")
      // Pourcentages et décimales : 1,5 % → 1 virgule 5 pour cent.
      .replace(/(\d),(\d)/g, "$1 virgule $2")
      .replace(/ ?%/g, " pour cent")
      // Ratios écrits sans espace (1:2) ; « étape 1 : 50 euros » reste intact.
      .replace(/(\d+):(\d+)\b/g, "$1 pour $2")
      .replace(/×/g, " fois ")
      .replace(/−/g, "moins ")
      .replace(/\bEUR\/USD\b/g, "euro dollar")
      .replace(/—|–/g, ", ")
      .replace(/[«»"]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Empreinte stable des textes d'une capsule (FNV-1a sur 32 bits, en hexadécimal). */
export function empreinteTextes(textes: string[]) {
  let h = 2166136261;
  const s = JSON.stringify(textes);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
