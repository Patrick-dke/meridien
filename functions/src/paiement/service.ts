import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { auditer, db, FieldValue, maintenant } from "../commun";
import { FAPSHI_API_KEY, FAPSHI_API_USER, FAPSHI_ENV, FAPSHI_MODE, PAIEMENT_FOURNISSEUR, SITE_URL } from "../config";
import { ErreurFournisseur, fapshi, simulation, type Consultation, type Fournisseur } from "./fournisseurs";

export type StatutTransaction = "initialisation" | "en_attente" | "reussi" | "echoue" | "expire";
const TERMINAUX: StatutTransaction[] = ["reussi", "echoue", "expire"];

/** Prestataire actif, ou null si l'encaissement n'est pas configuré (le site l'annonce alors clairement). */
export function fournisseurActif(): Fournisseur | null {
  try {
    switch (PAIEMENT_FOURNISSEUR.value()) {
      case "simulation":
        return simulation();
      case "fapshi":
        return fapshi({
          apiUser: FAPSHI_API_USER.value(),
          apiKey: FAPSHI_API_KEY.value(),
          env: FAPSHI_ENV.value() === "live" ? "live" : "sandbox",
          mode: FAPSHI_MODE.value() === "lien" ? "lien" : "direct",
          retour: `${SITE_URL.value()}/paiement/retour/`,
        });
      default:
        return null;
    }
  } catch (e) {
    logger.warn("Prestataire indisponible", e);
    return null;
  }
}

/** Fournisseur ayant servi pour une transaction donnée (il peut différer du fournisseur actif après un changement). */
export function fournisseurDe(nom: string): Fournisseur {
  const f = fournisseurActif();
  if (f && f.nom === nom) return f;
  throw new HttpsError("failed-precondition", `Le prestataire « ${nom} » de cette transaction n'est plus configuré.`);
}

/**
 * Applique le statut confirmé PAR LE PRESTATAIRE (jamais celui annoncé par le navigateur).
 * Idempotent : rejouer le même statut ne change rien ; une contradiction après un statut final
 * n'écrase rien, elle est signalée comme anomalie pour l'administration.
 */
export async function appliquer(idTransaction: string, c: Consultation, source: "verification" | "webhook" | "reconciliation" | "administration") {
  const refTx = db.doc(`transactions/${idTransaction}`);
  return db.runTransaction(async (t) => {
    const tx = await t.get(refTx);
    if (!tx.exists) throw new Error(`Transaction ${idTransaction} introuvable`);
    const d = tx.data()!;
    const refCommande = db.doc(`commandes/${d.commande}`);
    const refDroit = db.doc(`droits/${d.uid}_${d.module}`);
    const droit = await t.get(refDroit);
    const date = maintenant();
    const statutActuel = d.statut as StatutTransaction;

    t.update(refTx, { verifieLe: date, nbVerifications: FieldValue.increment(1) });
    if (c.statut === "en_attente" || c.statut === statutActuel) return statutActuel;

    if (TERMINAUX.includes(statutActuel)) {
      t.update(refTx, { anomalie: { date, source, statutPrestataire: c.statut, detail: "Statut contradictoire après un statut final" } });
      auditer({ acteur: "systeme", action: "paiement.anomalie", cible: idTransaction, details: { avant: statutActuel, prestataire: c.statut, source } }, t);
      return statutActuel;
    }

    if (c.statut === "reussi") {
      // Le montant encaissé doit être exactement celui de la commande : sinon, rien n'est débloqué.
      if (c.montant !== undefined && c.montant !== d.montant) {
        t.update(refTx, {
          statut: "reussi",
          historique: FieldValue.arrayUnion({ statut: "reussi", date, source }),
          anomalie: { date, source, detail: `Montant reçu ${c.montant} au lieu de ${d.montant}` },
        });
        auditer({ acteur: "systeme", action: "paiement.montant_incoherent", cible: idTransaction, details: { attendu: d.montant, recu: c.montant } }, t);
        return "reussi";
      }
      t.update(refTx, { statut: "reussi", historique: FieldValue.arrayUnion({ statut: "reussi", date, source }), confirmeLe: date });
      t.update(refCommande, { statut: "payee", payeeLe: date });
      if (!droit.exists || droit.get("actif") !== true) {
        t.set(refDroit, { uid: d.uid, module: d.module, actif: true, source: "paiement", transaction: idTransaction, accordeLe: date, test: d.environnement === "test" });
      }
      auditer({ acteur: "systeme", action: "paiement.confirme", cible: idTransaction, details: { module: d.module, montant: d.montant, source, environnement: d.environnement } }, t);
      return "reussi";
    }

    t.update(refTx, { statut: c.statut, historique: FieldValue.arrayUnion({ statut: c.statut, date, source }) });
    t.update(refCommande, { statut: c.statut === "expire" ? "expiree" : "echouee" });
    auditer({ acteur: "systeme", action: `paiement.${c.statut}`, cible: idTransaction, details: { source } }, t);
    return c.statut;
  });
}

/** Interroge le prestataire puis applique le résultat ; les erreurs réseau laissent la transaction en attente. */
export async function verifierAupresDuPrestataire(idTransaction: string, source: Parameters<typeof appliquer>[2]) {
  const tx = await db.doc(`transactions/${idTransaction}`).get();
  if (!tx.exists) throw new HttpsError("not-found", "Transaction introuvable.");
  const d = tx.data()!;
  if (!d.idFournisseur) return d.statut as StatutTransaction;
  try {
    const c = await fournisseurDe(d.fournisseur).consulter(d.idFournisseur);
    if (c.reference && c.reference !== idTransaction) {
      await auditer({ acteur: "systeme", action: "paiement.reference_incoherente", cible: idTransaction, details: { recue: c.reference } });
      return d.statut as StatutTransaction;
    }
    return await appliquer(idTransaction, c, source);
  } catch (e) {
    if (e instanceof ErreurFournisseur || e instanceof TypeError) {
      logger.warn("Vérification impossible pour le moment", { idTransaction, erreur: String(e) });
      return d.statut as StatutTransaction;
    }
    throw e;
  }
}
