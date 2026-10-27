import { db, maintenant } from "../commun";
import type { Operateur } from "../telephone";

/** Statut normalisé, quel que soit le prestataire. */
export type StatutPaiement = "en_attente" | "reussi" | "echoue" | "expire";

export type DemandePaiement = {
  montant: number;
  telephone: string;
  operateur: Operateur;
  /** Notre identifiant de transaction, transmis au prestataire pour le rapprochement. */
  reference: string;
  uid: string;
  libelle: string;
};

export type Initiation = {
  idFournisseur: string;
  statut: StatutPaiement;
  /** Page de paiement hébergée par le prestataire, quand le paiement direct n'est pas ouvert. */
  lien?: string;
};

export type Consultation = { statut: StatutPaiement; montant?: number; reference?: string; brut: Record<string, unknown> };

export interface Fournisseur {
  nom: "simulation" | "fapshi";
  /** "test" : aucun argent réel ne circule. */
  environnement: "test" | "production";
  initier(d: DemandePaiement): Promise<Initiation>;
  consulter(idFournisseur: string): Promise<Consultation>;
}

export class ErreurFournisseur extends Error {}

/* ------------------------------------------------------------------ */
/* Simulation : utilisable uniquement dans les émulateurs Firebase.    */
/* ------------------------------------------------------------------ */

/**
 * Mêmes numéros de test que le bac à sable Fapshi, pour que les deux environnements se comportent pareil :
 * se terminant par 0 ou 2 → réussi, par 1 ou 3 → échoué ; 6xxxxxx09 → expiré ; tout autre numéro → réussi.
 * Le paiement reste « en attente » quelques secondes, le temps de montrer l'écran de validation.
 */
export function issueSimulee(telephone: string): StatutPaiement {
  if (telephone.endsWith("09")) return "expire";
  const dernier = telephone.at(-1);
  return dernier === "1" || dernier === "3" ? "echoue" : "reussi";
}

export const DELAI_SIMULATION_MS = 6000;

export function simulation(): Fournisseur {
  if (process.env.FUNCTIONS_EMULATOR !== "true") throw new ErreurFournisseur("La simulation n'existe que dans l'environnement de test.");
  return {
    nom: "simulation",
    environnement: "test",
    async initier(d) {
      const ref = db.collection("simulations").doc();
      await ref.set({ ...d, creeLe: maintenant(), issue: issueSimulee(d.telephone) });
      return { idFournisseur: `SIM-${ref.id}`, statut: "en_attente" };
    },
    async consulter(id) {
      const doc = await db.doc(`simulations/${id.replace(/^SIM-/, "")}`).get();
      if (!doc.exists) throw new ErreurFournisseur("Transaction simulée inconnue.");
      const ecoule = Date.now() - Date.parse(doc.get("creeLe"));
      const statut: StatutPaiement = ecoule < DELAI_SIMULATION_MS ? "en_attente" : doc.get("issue");
      return { statut, montant: doc.get("montant"), reference: doc.get("reference"), brut: { simulation: true, statut } };
    },
  };
}

/* ------------------------------------------------------------------ */
/* Fapshi : https://docs.fapshi.com (bac à sable et production).       */
/* ------------------------------------------------------------------ */

const STATUTS_FAPSHI: Record<string, StatutPaiement> = {
  CREATED: "en_attente",
  PENDING: "en_attente",
  SUCCESSFUL: "reussi",
  FAILED: "echoue",
  EXPIRED: "expire",
};

export function fapshi(cfg: { apiUser: string; apiKey: string; env: "sandbox" | "live"; mode: "direct" | "lien"; retour: string }): Fournisseur {
  if (!cfg.apiUser || !cfg.apiKey) throw new ErreurFournisseur("Identifiants Fapshi absents.");
  const base = cfg.env === "live" ? "https://live.fapshi.com" : "https://sandbox.fapshi.com";
  const entetes = { apiuser: cfg.apiUser, apikey: cfg.apiKey, "content-type": "application/json" };

  async function appel(chemin: string, init?: RequestInit) {
    const rep = await fetch(base + chemin, { ...init, headers: entetes, signal: AbortSignal.timeout(20000) });
    const corps = (await rep.json().catch(() => ({}))) as Record<string, unknown>;
    if (!rep.ok) throw new ErreurFournisseur(typeof corps.message === "string" ? corps.message : `Fapshi a répondu ${rep.status}.`);
    return corps;
  }

  return {
    nom: "fapshi",
    environnement: cfg.env === "live" ? "production" : "test",
    async initier(d) {
      const commun = { amount: d.montant, userId: d.uid, externalId: d.reference, message: d.libelle.slice(0, 100) };
      if (cfg.mode === "direct") {
        // Paiement direct : l'opérateur envoie la demande de validation sur le téléphone ; le code secret
        // se saisit dans la fenêtre de l'opérateur, jamais sur notre site.
        const r = await appel("/direct-pay", {
          method: "POST",
          body: JSON.stringify({ ...commun, phone: d.telephone, medium: d.operateur === "mtn" ? "mobile money" : "orange money" }),
        });
        return { idFournisseur: String(r.transId), statut: "en_attente" };
      }
      // Page de paiement hébergée par Fapshi, quand le paiement direct n'est pas encore activé sur le compte.
      const r = await appel("/initiate-pay", { method: "POST", body: JSON.stringify({ ...commun, redirectUrl: cfg.retour }) });
      return { idFournisseur: String(r.transId), statut: "en_attente", lien: String(r.link) };
    },
    async consulter(id) {
      const r = await appel(`/payment-status/${encodeURIComponent(id)}`);
      const statut = STATUTS_FAPSHI[String(r.status)];
      if (!statut) throw new ErreurFournisseur(`Statut Fapshi inconnu : ${String(r.status)}`);
      return { statut, montant: Number(r.amount), reference: typeof r.externalId === "string" ? r.externalId : undefined, brut: r };
    },
  };
}
