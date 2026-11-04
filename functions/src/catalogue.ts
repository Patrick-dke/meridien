import { z } from "zod";
import { db } from "./commun";

/**
 * Catalogue des indicateurs et robots, côté serveur : il décide qui peut demander quoi. Les fiches complètes
 * (textes, fonctions, conditions) vivent en base, écrites par l'administration ; sans fiche en base, ces valeurs de
 * départ s'appliquent, outils fermés aux demandes. Aucun prix ici : il se fixe dans l'administration.
 */

export const OutilSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,40}$/),
  nom: z.string().trim().min(2).max(80),
  categorie: z.enum(["indicateur", "robot"]),
  plateforme: z.enum(["TradingView", "MetaTrader 5"]),
  resume: z.string().trim().min(10).max(300),
  fonctionnalites: z.array(z.string().trim().min(2).max(200)).max(12),
  conditionsUtilisation: z.array(z.string().trim().min(2).max(200)).max(12),
  statut: z.enum(["disponible", "sur-demande", "en-preparation", "suspendu"]),
  modesAcces: z.array(z.enum(["achat", "parcours", "etudiants"])).max(3),
  prix: z.number().int().min(0).max(10_000_000).nullable(),
  modulesInclus: z.array(z.string().regex(/^[a-z0-9-]{2,60}$/)).max(20),
  ordre: z.number().int().min(0).max(100),
  publie: z.boolean(),
});
export type Outil = z.infer<typeof OutilSchema>;

const DEPART: Record<string, Pick<Outil, "id" | "nom" | "categorie" | "plateforme" | "statut" | "modesAcces" | "prix" | "modulesInclus" | "publie">> = {
  indicateur: {
    id: "indicateur",
    nom: "Indicateur Méridien",
    categorie: "indicateur",
    plateforme: "TradingView",
    statut: "en-preparation",
    modesAcces: ["etudiants", "achat"],
    prix: null,
    modulesInclus: [],
    publie: true,
  },
  ea: {
    id: "ea",
    nom: "Expert Advisor Méridien",
    categorie: "robot",
    plateforme: "MetaTrader 5",
    statut: "en-preparation",
    modesAcces: ["etudiants", "achat"],
    prix: null,
    modulesInclus: [],
    publie: true,
  },
};

/** Fiche d'un outil : la base d'abord, les valeurs de départ sinon ; null si l'outil n'existe pas. */
export async function outilDuCatalogue(id: string) {
  if (!/^[a-z0-9-]{2,40}$/.test(id)) return null;
  const doc = await db.doc(`catalogueOutils/${id}`).get();
  if (doc.exists) {
    const r = OutilSchema.safeParse({ ...doc.data(), id });
    return r.success ? r.data : null;
  }
  return DEPART[id] ?? null;
}

/** Les demandes ne s'ouvrent que pour un outil publié, disponible ou distribué sur demande. */
export const ouvertAuxDemandes = (o: Pick<Outil, "publie" | "statut">) => o.publie && (o.statut === "disponible" || o.statut === "sur-demande");
