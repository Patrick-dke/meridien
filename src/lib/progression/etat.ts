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

const plusRecent = (a?: string, b?: string) => (!a ? b : !b ? a : a > b ? a : b);
const plusAncien = (a?: string, b?: string) => (!a ? b : !b ? a : a < b ? a : b);

/**
 * Fusion de deux progressions (cet appareil et le compte) sans rien perdre : un chapitre terminé d'un côté
 * reste terminé, les meilleurs scores et le temps le plus long sont gardés, favoris et notes sont réunis.
 * Les réglages d'affichage restent ceux de l'appareil (`local`).
 */
export function fusionnerEtats(local: Etat, compte: Etat): Etat {
  const chapitres: Etat["chapitres"] = { ...compte.chapitres };
  for (const [slug, l] of Object.entries(local.chapitres)) {
    const c = chapitres[slug];
    if (!c) {
      chapitres[slug] = l;
      continue;
    }
    const meilleur = Math.max(l.meilleurScore ?? -1, c.meilleurScore ?? -1);
    chapitres[slug] = {
      statut: l.statut === "termine" || c.statut === "termine" ? "termine" : "en-cours",
      etape: Math.max(l.etape, c.etape),
      debut: plusAncien(l.debut, c.debut)!,
      fin: plusAncien(l.fin, c.fin),
      tempsS: Math.max(l.tempsS, c.tempsS),
      tentatives: Math.max(l.tentatives, c.tentatives),
      meilleurScore: meilleur >= 0 ? meilleur : undefined,
      dernierScore: l.dernierScore ?? c.dernierScore,
    };
    if (chapitres[slug].fin === undefined) delete chapitres[slug].fin;
    if (chapitres[slug].meilleurScore === undefined) delete chapitres[slug].meilleurScore;
    if (chapitres[slug].dernierScore === undefined) delete chapitres[slug].dernierScore;
  }
  const concepts: Etat["concepts"] = { ...compte.concepts };
  for (const [id, l] of Object.entries(local.concepts)) {
    const c = concepts[id];
    concepts[id] = !c || l.dernier > c.dernier || (l.dernier === c.dernier && l.scores.length >= c.scores.length) ? l : c;
  }
  const notes = { ...compte.notes };
  for (const [slug, texte] of Object.entries(local.notes)) {
    const autre = notes[slug];
    if (!autre || texte.includes(autre)) notes[slug] = texte;
    else if (!autre.includes(texte)) notes[slug] = `${texte}\n\n${autre}`.slice(0, 20000);
  }
  const journal: Record<string, number> = { ...compte.journal };
  for (const [jour, s] of Object.entries(local.journal ?? {})) journal[jour] = Math.max(s, journal[jour] ?? 0);
  const jours = Object.keys(journal).sort();
  for (const ancien of jours.slice(0, Math.max(0, jours.length - 60))) delete journal[ancien];

  const fusion: Etat = {
    version: VERSION,
    chapitres,
    concepts,
    favoris: [...new Set([...compte.favoris, ...local.favoris])],
    notes,
    reglages: local.reglages,
    journal,
  };
  const profil = local.profil && compte.profil ? (local.profil.date >= compte.profil.date ? local.profil : compte.profil) : (local.profil ?? compte.profil);
  if (profil) fusion.profil = profil;
  const visite = plusRecent(local.derniereVisite, compte.derniereVisite);
  if (visite) {
    fusion.derniereVisite = visite;
    const dernier = visite === local.derniereVisite ? local.dernierChapitre : compte.dernierChapitre;
    if (dernier) fusion.dernierChapitre = dernier;
  }
  return fusion;
}
