import { onRequest } from "firebase-functions/v2/https";
import { auditer, db, limiter, maintenant, REGION } from "../commun";
import { LICENCE_SIGNATURE } from "../config";
import { decider, genererCle, MESSAGES, normaliserCle, normaliserNumeroCompte, normaliserServeur, signer, type CompteAutorise, type Licence, type Raison } from "./regles";

/** Une clé neuve, garantie absente de la base. */
export async function cleUnique() {
  for (let i = 0; i < 5; i++) {
    const cle = genererCle();
    if ((await db.collection("licences").where("cle", "==", cle).limit(1).get()).empty) return cle;
  }
  throw new Error("Impossible de générer une clé unique.");
}

/** Création d'une licence (administration, ou acceptation d'une demande). */
export async function creerLicence(p: {
  uid: string;
  email?: string | null;
  outil: string;
  comptes: Omit<CompteAutorise, "ajouteLe">[];
  maxComptes: number;
  activationAuto: boolean;
  expireLe: string | null;
  note?: string | null;
  demande?: string | null;
  acteur: string;
}) {
  const ajouteLe = maintenant();
  const licence: Licence & Record<string, unknown> = {
    uid: p.uid,
    email: p.email ?? null,
    outil: p.outil,
    cle: await cleUnique(),
    statut: "active",
    comptes: p.comptes.map((c) => ({ ...c, ajouteLe })),
    maxComptes: Math.max(1, Math.min(10, p.maxComptes)),
    activationAuto: p.activationAuto,
    activations: p.comptes.length,
    expireLe: p.expireLe,
    note: p.note ?? null,
    demande: p.demande ?? null,
    creeLe: ajouteLe,
    creePar: p.acteur,
    derniereVerification: null,
  };
  const ref = await db.collection("licences").add(licence);
  await auditer({ acteur: p.acteur, action: "licence.creation", cible: ref.id, details: { uid: p.uid, outil: p.outil, comptes: p.comptes.length, maxComptes: licence.maxComptes, expireLe: p.expireLe } });
  return ref.id;
}

/**
 * Vérification appelée par le robot au démarrage puis à intervalle régulier (WebRequest de MetaTrader 5).
 * Entrée : clé, numéro de compte, serveur, version du robot, nonce aléatoire. Aucun mot de passe, aucun ordre :
 * ce point d'accès ne lit ni ne pilote le compte de trading, il dit seulement si le logiciel peut y fonctionner.
 * Réponse signée (HMAC-SHA256) : le robot vérifie la signature et que le nonce est bien le sien.
 */
export const verifierLicence = onRequest({ region: REGION, secrets: [LICENCE_SIGNATURE], cors: false, maxInstances: 5 }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ erreur: "Méthode POST attendue." });
    return;
  }
  const b = (req.body ?? {}) as Record<string, unknown>;
  const cle = normaliserCle(b.cle);
  const compte = normaliserNumeroCompte(b.compte);
  const serveur = normaliserServeur(b.serveur);
  const nonce = typeof b.nonce === "string" && /^[A-Za-z0-9]{8,64}$/.test(b.nonce) ? b.nonce : null;
  const version = typeof b.version === "string" ? b.version.slice(0, 20) : "";
  const horodatage = maintenant();
  const repondre = (raison: Raison, expireLe: string | null = null) => {
    const r = { valide: raison === "ok", raison, cle: cle ?? "", compte: compte ?? "", nonce: nonce ?? "", horodatage, expireLe };
    res.status(200).json({ ...r, message: MESSAGES[raison], signature: signer(LICENCE_SIGNATURE.value(), r) });
  };
  if (!cle || !compte || !serveur || !nonce) return repondre("requete-invalide");
  try {
    await limiter(`licence:${cle}`, 60, 3600, "Trop de vérifications.");
  } catch {
    res.status(429).json({ erreur: "Trop de vérifications pour cette licence. Réessaie dans une heure." });
    return;
  }
  const trouvee = await db.collection("licences").where("cle", "==", cle).limit(1).get();
  if (trouvee.empty) return repondre("inconnue");
  const ref = trouvee.docs[0].ref;
  const decision = await db.runTransaction(async (t) => {
    const l = (await t.get(ref)).data() as Licence;
    const d = decider(l, compte, serveur, new Date());
    const maj: Record<string, unknown> = { derniereVerification: { le: horodatage, compte, serveur, version, raison: d.raison } };
    if (d.ajouter) {
      maj.comptes = [...l.comptes, d.ajouter];
      maj.activations = (l.activations ?? 0) + 1;
      auditer({ acteur: "robot", action: "licence.activation", cible: ref.id, details: { compte, serveur, version } }, t);
    }
    t.update(ref, maj);
    return { raison: d.raison, expireLe: l.expireLe ?? null };
  });
  repondre(decision.raison, decision.expireLe);
});
