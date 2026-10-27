import { z } from "zod";

/** Badge de fiabilité porté par chaque bloc de contenu (dossier de cadrage, section 6). */
export const Fiabilite = z.enum(["fait", "calcul", "convention", "ecole", "hypothese", "mesure"]);
export type Fiabilite = z.infer<typeof Fiabilite>;

/** Cycle de validation : seul un contenu « publie » apparaît sur le site. */
export const Statut = z.enum(["brouillon", "verification", "valide", "publie"]);
export type Statut = z.infer<typeof Statut>;

const texte = z.string().min(1);

export const Bloc = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), texte, fiabilite: Fiabilite.optional() }),
  z.object({
    type: z.literal("liste"),
    items: z.array(texte).min(2),
    ordonnee: z.boolean().optional(),
    fiabilite: Fiabilite.optional(),
  }),
  z.object({
    type: z.literal("encadre"),
    variante: z.enum(["retenir", "attention", "risque", "ecole", "exemple"]),
    titre: z.string().optional(),
    texte,
    fiabilite: Fiabilite.optional(),
  }),
  z.object({ type: z.literal("formule"), texte, legende: z.string().optional(), fiabilite: Fiabilite.optional() }),
  z.object({
    type: z.literal("tableau"),
    // Une case d'en-tête peut être vide (colonne d'intitulés de lignes).
    entetes: z.array(z.string()).min(2),
    lignes: z.array(z.array(z.string())).min(1),
    legende: z.string().optional(),
    fiabilite: Fiabilite.optional(),
  }),
  z.object({ type: z.literal("figure"), scene: texte, legende: texte, fiabilite: Fiabilite.optional() }),
  z.object({ type: z.literal("outil"), outil: z.enum(["position", "rendement-risque", "pips", "esperance"]) }),
]);
export type Bloc = z.infer<typeof Bloc>;

export const VisuelScene = z.discriminatedUnion("type", [
  z.object({ type: z.literal("titre"), titre: texte, sousTitre: z.string().optional() }),
  z.object({ type: z.literal("figure"), scene: texte, etape: z.number().int().min(0).optional() }),
  z.object({ type: z.literal("points"), titre: z.string().optional(), items: z.array(texte).min(1) }),
  z.object({ type: z.literal("formule"), texte, legende: z.string().optional() }),
]);
export type VisuelScene = z.infer<typeof VisuelScene>;

export const Scene = z.object({
  /** Durée d'affichage en secondes ; calée sur un débit de narration de 140 à 160 mots par minute. */
  duree: z.number().min(2).max(20),
  texte,
  visuel: VisuelScene,
});
export type Scene = z.infer<typeof Scene>;

const baseQuestion = {
  id: texte,
  enonce: texte,
  explication: texte,
  concepts: z.array(texte).min(1),
};

export const Question = z.discriminatedUnion("type", [
  z.object({ ...baseQuestion, type: z.literal("unique"), choix: z.array(texte).min(2), bonne: z.number().int().min(0) }),
  z.object({
    ...baseQuestion,
    type: z.literal("multiple"),
    choix: z.array(texte).min(3),
    bonnes: z.array(z.number().int().min(0)).min(1),
  }),
  z.object({ ...baseQuestion, type: z.literal("vraifaux"), reponse: z.boolean() }),
  z.object({ ...baseQuestion, type: z.literal("association"), paires: z.array(z.tuple([texte, texte])).min(3) }),
  /** `etapes` est donné dans l'ordre correct ; l'interface le mélange. */
  z.object({ ...baseQuestion, type: z.literal("ordre"), etapes: z.array(texte).min(3) }),
]);
export type Question = z.infer<typeof Question>;

const baseExercice = { id: texte, consigne: texte, corrige: texte, concepts: z.array(texte).min(1) };

/** Exercices d'application, notés à part du quiz : calcul, lecture de graphique, réflexion guidée. */
export const Exercice = z.discriminatedUnion("type", [
  /** Réponse numérique, juste si elle est à `tolerance` près de `reponse`. */
  z.object({ ...baseExercice, type: z.literal("calcul"), reponse: z.number(), tolerance: z.number().min(0), unite: z.string().optional(), aide: z.string().optional() }),
  /** L'apprenant touche sur le graphique la ou les bougies demandées (indices de `bonnes`, à partir de 0). */
  z.object({ ...baseExercice, type: z.literal("graphique"), scene: texte, etape: z.number().int().min(0).optional(), bonnes: z.array(z.number().int().min(0)).min(1) }),
  /** Question ouverte : l'apprenant écrit sa réponse, puis compare au corrigé. */
  z.object({ ...baseExercice, type: z.literal("reflexion") }),
]);
export type Exercice = z.infer<typeof Exercice>;

export const Chapitre = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  titre: texte,
  sousTitre: texte,
  academie: texte,
  module: texte,
  niveau: z.number().int().min(1).max(5),
  dureeMin: z.number().int().min(5).max(30),
  statut: Statut,
  misAJour: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  objectifs: z.array(texte).min(2).max(5),
  concepts: z.array(texte).min(1),
  prerequis: z.array(texte),
  intro: texte,
  capsule: z.object({ titre: texte, scenes: z.array(Scene).min(4) }),
  cours: z.array(z.object({ titre: texte, blocs: z.array(Bloc).min(1) })).min(2),
  illustrations: z.array(Bloc),
  exemple: z.object({ titre: texte, blocs: z.array(Bloc).min(1) }).nullable(),
  erreurs: z.array(z.object({ titre: texte, texte })).min(2).max(4),
  resume: z.array(texte).min(3).max(6),
  exercices: z.array(Exercice).min(1).max(4),
  quiz: z.array(Question).min(4).max(8),
});
export type Chapitre = z.infer<typeof Chapitre>;

export const Concept = z.object({
  id: texte,
  nom: texte,
  /** Chapitre qui enseigne ce concept : cible des recommandations. */
  chapitre: texte,
  prerequis: z.array(texte),
});
export type Concept = z.infer<typeof Concept>;

export const Terme = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  terme: texte,
  synonymes: z.array(z.string()),
  court: texte,
  long: texte,
  fiabilite: Fiabilite,
  chapitre: z.string().optional(),
  voirAussi: z.array(z.string()),
});
export type Terme = z.infer<typeof Terme>;

export const ChapitreCatalogue = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  titre: texte,
});

export const Module = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  titre: texte,
  description: texte,
  chapitres: z.array(ChapitreCatalogue).min(1),
});
export type Module = z.infer<typeof Module>;

export const Academie = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  code: texte,
  titre: texte,
  description: texte,
  niveau: texte,
  ecole: z.boolean(),
  modules: z.array(Module).min(1),
});
export type Academie = z.infer<typeof Academie>;
