import { HttpsError, onCall } from "firebase-functions/v2/https";
import { auditer, auth, db, maintenant, REGION, utilisateurActif } from "./commun";
import { ADMIN_EMAILS } from "./config";

/**
 * Premier administrateur : seule une adresse listée dans ADMIN_EMAILS (configuration serveur), vérifiée,
 * peut se déclarer administrateur. Les suivants sont nommés depuis l'administration.
 */
export const revendiquerAdmin = onCall({ region: REGION }, async (req) => {
  const uid = await utilisateurActif(req);
  const email = String(req.auth?.token.email ?? "").toLowerCase();
  const autorises = ADMIN_EMAILS.value()
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!email || req.auth?.token.email_verified !== true || !autorises.includes(email)) throw new HttpsError("permission-denied", "Adresse non autorisée.");
  await db.doc(`admins/${uid}`).set({ email, depuis: maintenant(), nommePar: "configuration" });
  await auth.setCustomUserClaims(uid, { admin: true });
  await auditer({ acteur: uid, action: "admin.revendique", cible: uid, details: { email } });
  return { ok: true };
});

/** Ferme toutes les sessions ouvertes du compte (téléphone perdu, ordinateur partagé). */
export const deconnecterPartout = onCall({ region: REGION }, async (req) => {
  const uid = await utilisateurActif(req);
  await auth.revokeRefreshTokens(uid);
  await auditer({ acteur: uid, action: "compte.sessions_revoquees", cible: uid });
  return { ok: true };
});
