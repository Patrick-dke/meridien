import { z } from "zod";

/** Version du format enregistré ; à incrémenter avec une migration si la forme change. */
export const VERSION = 1;

const EtatChapitre = z.object({
  statut: z.enum(["en-cours", "termine"]),
  etape: z.number().int().min(0),
  debut: z.string(),
  fin: z.string().optional(),
  tempsS: z.number().min(0),
  tentatives: z.number().int().min(0),
  meilleurScore: z.number().min(0).max(1).optional(),
  dernierScore: z.number().min(0).max(1).optional(),
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
  concepts: z.record(z.string(), z.object({ scores: z.array(z.number().min(0).max(1)), dernier: z.string() })),
  favoris: z.array(z.string()),
  notes: z.record(z.string(), z.string().max(20000)),
  reglages: Reglages,
  profil: Profil.optional(),
  derniereVisite: z.string().optional(),
  dernierChapitre: z.string().optional(),
});
export type Etat = z.infer<typeof Etat>;

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
