import { createHash, timingSafeEqual } from "node:crypto";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, type Transaction } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

if (!getApps().length) initializeApp();

export const db = getFirestore();
export const auth = getAuth();
/** Région proche du Cameroun parmi celles de Firebase : les appels restent rapides depuis Douala ou Yaoundé. */
export const REGION = "europe-west1";
export const maintenant = () => new Date().toISOString();
export { FieldValue };

/** Comparaison en temps constant (secrets de webhooks) : ne révèle rien par sa durée. */
export function egalSecurise(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const hacher = (texte: string) => createHash("sha256").update(texte).digest("hex").slice(0, 32);

/** Exige un utilisateur connecté et non suspendu ; renvoie son uid. */
export async function utilisateurActif(req: CallableRequest): Promise<string> {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Connecte-toi pour continuer.");
  const profil = await db.doc(`utilisateurs/${uid}`).get();
  if (profil.exists && profil.get("statut") === "suspendu") throw new HttpsError("permission-denied", "Ce compte est suspendu. Contacte l'équipe.");
  return uid;
}

/** Exige un administrateur : jeton marqué admin, ou fiche dans la collection admins (créée depuis la console). */
export async function administrateur(req: CallableRequest): Promise<string> {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Connexion requise.");
  if (req.auth?.token.admin === true) return uid;
  if ((await db.doc(`admins/${uid}`).get()).exists) return uid;
  throw new HttpsError("permission-denied", "Réservé à l'administration.");
}

/**
 * Journal d'audit, en ajout seul : aucune règle ne permet de modifier ou d'effacer une entrée.
 * Dans une transaction Firestore, l'entrée est écrite avec le reste ou pas du tout.
 */
export function auditer(
  entree: { acteur: string; action: string; cible: string; details?: Record<string, unknown>; motif?: string },
  t?: Transaction,
) {
  const ref = db.collection("journalAudit").doc();
  const donnees = { ...entree, date: maintenant() };
  if (t) t.set(ref, donnees);
  else return ref.set(donnees);
}

/**
 * Limiteur de débit simple : au plus `max` actions par fenêtre de `fenetreS` secondes pour une clé donnée
 * (utilisateur, adresse hachée…). Lève une erreur claire quand la limite est atteinte.
 */
export async function limiter(cle: string, max: number, fenetreS: number, message: string) {
  const ref = db.doc(`limites/${hacher(cle)}`);
  await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const debut = Date.now() - fenetreS * 1000;
    const recents = ((doc.get("t") as number[] | undefined) ?? []).filter((x) => x > debut);
    if (recents.length >= max) throw new HttpsError("resource-exhausted", message);
    t.set(ref, { t: [...recents, Date.now()], expire: new Date(Date.now() + fenetreS * 1000) });
  });
}
