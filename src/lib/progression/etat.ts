// zod/mini : mêmes règles que zod, une fraction du poids. Ce fichier est chargé sur chaque page.
import { z } from "zod/mini";

/** Version du format enregistré ; à incrémenter avec une migration si la forme change. */
export const VERSION = 1;

const positif = () => z.number().check(z.minimum(0));
const entierPositif = () => z.number().check(z.int(), z.minimum(0));
const part = () => z.number().check(z.minimum(0), z.maximum(1));

const EtatChapitre = z.object({
  statut: z.enum(["en-cours", "termine"]),
  etape: entierPositif(),
  debut: z.string(),
  fin: z.optional(z.string()),
  tempsS: positif(),
  tentatives: entierPositif(),
  meilleurScore: z.optional(part()),
  dernierScore: z.optional(part()),
});
export type EtatChapitre = z.infer<typeof EtatChapitre>;

export const Reglages = z.object({
  leger: z.enum(["auto", "oui", "non"]),
  palette: z.enum(["standard", "daltonien"]),
  texte: z.enum(["normal", "grand"]),
});
export type Reglages = z.infer<typeof Reglages>;

export const Profil = z.object({
  objectif: z.enum(["decouvrir", "methode", "smc-ict"]),
  niveau: z.enum(["debutant", "notions", "pratique"]),
  temps: z.enum(["10", "20", "45"]),
  date: z.string(),
});
export type Profil = z.infer<typeof Profil>;

export const Etat = z.object({
  version: z.literal(VERSION),
  chapitres: z.record(z.string(), EtatChapitre),
  /** Historique des scores (0 à 1) par concept, du plus ancien au plus récent ; 20 au plus. */
  concepts: z.record(z.string(), z.object({ scores: z.array(part()), dernier: z.string() })),
  favoris: z.array(z.string()),
  notes: z.record(z.string(), z.string().check(z.maxLength(20000))),
  reglages: Reglages,
  profil: z.optional(Profil),
  derniereVisite: z.optional(z.string()),
  dernierChapitre: z.optional(z.string()),
  /** Temps d'apprentissage par jour (AAAA-MM-JJ → secondes), 60 jours au plus. Ajouté sans changer de version : facultatif. */
  journal: z.optional(z.record(z.string(), positif())),
});
export type Etat = z.infer<typeof Etat>;

/** Date du jour dans le fuseau de l'appareil, au format AAAA-MM-JJ. */
export function jourLocal(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Ajoute du temps au journal quotidien et ne garde que les 60 jours les plus récents. */
export function ajouterAuJournal(journal: Record<string, number> | undefined, jour: string, secondes: number) {
  const suivant = { ...journal, [jour]: (journal?.[jour] ?? 0) + secondes };
  const jours = Object.keys(suivant).sort();
  for (const ancien of jours.slice(0, Math.max(0, jours.length - 60))) delete suivant[ancien];
  return suivant;
}

export const ETAT_VIDE: Etat = {
  version: VERSION,
  chapitres: {},
  concepts: {},
  favoris: [],
  notes: {},
  reglages: { leger: "auto", palette: "standard", texte: "normal" },
};

/** Lit un état enregistré ou importé ; renvoie null s'il est illisible ou d'un autre format. */
export function lireEtat(texte: string | null): Etat | null {
  if (!texte) return null;
  try {
    const resultat = Etat.safeParse(JSON.parse(texte));
    return resultat.success ? resultat.data : null;
  } catch {
    return null;
  }
}

/** Enregistre les scores d'un quiz dans l'historique de chaque concept. */
export function ajouterScoresConcepts(etat: Etat, scores: { concept: string; score: number }[], date: string): Etat {
  const concepts = { ...etat.concepts };
  for (const { concept, score } of scores) {
    const precedents = concepts[concept]?.scores ?? [];
    concepts[concept] = { scores: [...precedents, score].slice(-20), dernier: date };
  }
  return { ...etat, concepts };
}
