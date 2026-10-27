import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import { z } from "zod";
import { auditer, db, egalSecurise, hacher, limiter, maintenant, REGION, utilisateurActif } from "../commun";
import { enEmulation, FAPSHI_WEBHOOK_SECRET, secretsPaiement } from "../config";
import { masquer, normaliserTelephone, operateurProbable } from "../telephone";
import { ErreurFournisseur } from "./fournisseurs";
import { fournisseurActif, verifierAupresDuPrestataire } from "./service";

const options = { region: REGION, secrets: secretsPaiement };

const Demande = z.object({
  module: z.string().min(1).max(60),
  operateur: z.enum(["mtn", "orange"]),
  telephone: z.string().min(9).max(20),
  /** Identifiant d'essai généré par le navigateur : un double clic ou une reconnexion ne crée pas deux paiements. */
  cle: z.string().regex(/^[\w-]{16,64}$/),
});

async function estAdmin(uid: string) {
  return (await db.doc(`admins/${uid}`).get()).exists;
}

/** Ce que la page de paiement doit savoir avant d'afficher le formulaire. */
export const etatPaiement = onCall(options, async () => {
  const f = fournisseurActif();
  const pub = (await db.doc("parametres/public").get()).data() ?? {};
  return {
    ouvert: Boolean(f) && pub.paiementOuvert === true,
    environnement: f?.environnement ?? null,
    simulation: f?.nom === "simulation",
    operateurs: ["mtn", "orange"],
  };
});

export const initierPaiement = onCall(options, async (req) => {
  const uid = await utilisateurActif(req);
  if (req.auth?.token.email_verified !== true) throw new HttpsError("failed-precondition", "Vérifie d'abord ton adresse e-mail (lien reçu à l'inscription).");
  const parse = Demande.safeParse(req.data);
  if (!parse.success) throw new HttpsError("invalid-argument", "Demande de paiement incomplète.");
  const { module, operateur, cle } = parse.data;
  const telephone = normaliserTelephone(parse.data.telephone);
  if (!telephone) throw new HttpsError("invalid-argument", "Numéro camerounais attendu : 9 chiffres commençant par 6.");
  const probable = operateurProbable(telephone);
  if (probable && probable !== operateur) {
    throw new HttpsError("invalid-argument", `Ce numéro semble être un numéro ${probable === "mtn" ? "MTN" : "Orange"}. Vérifie l'opérateur choisi.`);
  }

  // Idempotence : la même clé renvoie la même commande, sans nouvel appel au prestataire.
  const idCommande = hacher(`${uid}:${cle}`);
  const existante = await db.doc(`commandes/${idCommande}`).get();
  if (existante.exists) {
    const tx = await db.doc(`transactions/${existante.get("transaction")}`).get();
    return { commande: idCommande, transaction: tx.id, statut: tx.get("statut"), lien: tx.get("lien") ?? null, environnement: tx.get("environnement") };
  }

  await limiter(`paiement:${uid}`, 5, 600, "Trop de tentatives de paiement. Patiente dix minutes avant de réessayer.");

  const f = fournisseurActif();
  const pub = (await db.doc("parametres/public").get()).data() ?? {};
  if (!f || pub.paiementOuvert !== true) throw new HttpsError("failed-precondition", "Le paiement en ligne n'est pas encore ouvert.");
  // Un bac à sable branché sur le site réel ne sert qu'aux essais de l'équipe : il ne doit rien ouvrir au public.
  if (f.environnement === "test" && !enEmulation() && !(await estAdmin(uid))) {
    throw new HttpsError("failed-precondition", "Le paiement en ligne n'est pas encore ouvert.");
  }

  const mod = await db.doc(`modules/${module}`).get();
  const prix = mod.get("prix");
  if (!mod.exists || mod.get("publie") !== true || mod.get("gratuit") === true || !Number.isInteger(prix) || prix < 100) {
    throw new HttpsError("failed-precondition", "Ce module n'est pas en vente pour le moment.");
  }
  if ((await db.doc(`droits/${uid}_${module}`).get()).get("actif") === true) throw new HttpsError("already-exists", "Tu as déjà accès à ce module.");

  // Anti-doublon : un paiement encore en attente pour ce module bloque une nouvelle demande pendant 10 minutes.
  const enCours = await db.collection("transactions").where("uid", "==", uid).where("module", "==", module).where("statut", "==", "en_attente").get();
  const recent = enCours.docs.find((d) => Date.now() - Date.parse(d.get("creeLe")) < 10 * 60_000);
  if (recent) {
    return { commande: recent.get("commande"), transaction: recent.id, statut: "en_attente", lien: recent.get("lien") ?? null, environnement: recent.get("environnement"), dejaEnCours: true };
  }

  const refTx = db.collection("transactions").doc();
  const date = maintenant();
  const lot = db.batch();
  lot.set(db.doc(`commandes/${idCommande}`), { uid, module, montant: prix, devise: "XAF", statut: "en_attente", transaction: refTx.id, creeLe: date });
  lot.set(refTx, {
    uid,
    commande: idCommande,
    module,
    montant: prix,
    devise: "XAF",
    operateur,
    telephone,
    telephoneMasque: masquer(telephone),
    fournisseur: f.nom,
    environnement: f.environnement,
    statut: "initialisation",
    historique: [{ statut: "initialisation", date, source: "demande" }],
    creeLe: date,
  });
  await lot.commit();

  try {
    const r = await f.initier({ montant: prix, telephone, operateur, reference: refTx.id, uid, libelle: `Méridien : ${mod.get("titre") ?? module}` });
    await refTx.update({ idFournisseur: r.idFournisseur, statut: "en_attente", lien: r.lien ?? null, historique: [{ statut: "initialisation", date, source: "demande" }, { statut: "en_attente", date: maintenant(), source: "prestataire" }] });
    await auditer({ acteur: uid, action: "paiement.initie", cible: refTx.id, details: { module, montant: prix, operateur, fournisseur: f.nom, environnement: f.environnement } });
    return { commande: idCommande, transaction: refTx.id, statut: "en_attente", lien: r.lien ?? null, environnement: f.environnement };
  } catch (e) {
    const motif = e instanceof ErreurFournisseur ? e.message : "Prestataire injoignable";
    await refTx.update({ statut: "echoue", motif, historique: [{ statut: "initialisation", date, source: "demande" }, { statut: "echoue", date: maintenant(), source: "prestataire" }] });
    await db.doc(`commandes/${idCommande}`).update({ statut: "echouee" });
    await auditer({ acteur: uid, action: "paiement.refuse_a_l_initiation", cible: refTx.id, details: { motif } });
    throw new HttpsError("unavailable", `Le paiement n'a pas pu démarrer : ${motif}. Aucun montant n'a été prélevé.`);
  }
});

/** Le navigateur demande où en est son paiement ; la réponse vient toujours du prestataire ou de la base. */
export const verifierPaiement = onCall(options, async (req) => {
  const uid = await utilisateurActif(req);
  const id = typeof req.data?.transaction === "string" ? req.data.transaction : "";
  const tx = id ? await db.doc(`transactions/${id}`).get() : null;
  if (!tx?.exists || (tx.get("uid") !== uid && !(await estAdmin(uid)))) throw new HttpsError("not-found", "Transaction introuvable.");
  let statut = tx.get("statut");
  // Au plus une interrogation du prestataire toutes les 10 secondes par transaction (Fapshi limite le débit).
  const derniere = Date.parse(tx.get("verifieLe") ?? tx.get("creeLe"));
  if (statut === "en_attente" && Date.now() - derniere > 10_000) statut = await verifierAupresDuPrestataire(id, "verification");
  return { statut, module: tx.get("module"), environnement: tx.get("environnement"), lien: tx.get("lien") ?? null, motif: tx.get("motif") ?? null };
});

/**
 * Notification du prestataire. Elle est authentifiée par un secret partagé (en-tête `x-wh-secret`),
 * puis le statut est RELU auprès du prestataire : le contenu du message ne suffit jamais à débloquer un module.
 */
export const webhookPaiement = onRequest({ ...options, cors: false }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Méthode non autorisée");
    return;
  }
  const secret = FAPSHI_WEBHOOK_SECRET.value();
  if (!secret || !egalSecurise(String(req.get("x-wh-secret") ?? ""), secret)) {
    logger.warn("Webhook refusé : secret invalide");
    res.status(401).send("Non autorisé");
    return;
  }
  const idFournisseur = typeof req.body?.transId === "string" ? req.body.transId : "";
  const trouve = idFournisseur ? await db.collection("transactions").where("idFournisseur", "==", idFournisseur).limit(1).get() : null;
  if (!trouve || trouve.empty) {
    logger.warn("Webhook pour une transaction inconnue", { idFournisseur });
    res.status(200).send("ignoré");
    return;
  }
  const statut = await verifierAupresDuPrestataire(trouve.docs[0].id, "webhook");
  res.status(200).json({ ok: true, statut });
});

/** Rapprochement périodique : rattrape les webhooks perdus (Fapshi ne les renvoie pas) et signale les cas bloqués. */
export const reconcilier = onSchedule({ schedule: "every 10 minutes", region: REGION, secrets: secretsPaiement, timeoutSeconds: 300 }, async () => {
  await reconcilierMaintenant();
});

export async function reconcilierMaintenant() {
  const enAttente = await db.collection("transactions").where("statut", "in", ["en_attente", "initialisation"]).limit(200).get();
  let verifiees = 0;
  for (const d of enAttente.docs) {
    const age = Date.now() - Date.parse(d.get("creeLe"));
    if (age < 2 * 60_000) continue;
    if (d.get("statut") === "initialisation" || age > 48 * 3600_000) {
      if (!d.get("aVerifier")) {
        await d.ref.update({ aVerifier: true });
        await auditer({ acteur: "systeme", action: "paiement.a_verifier", cible: d.id, details: { statut: d.get("statut"), ageHeures: Math.round(age / 3600_000) } });
      }
      if (d.get("statut") === "initialisation") continue;
    }
    await verifierAupresDuPrestataire(d.id, "reconciliation");
    verifiees++;
    // Débit limité côté prestataire : on espace les appels.
    await new Promise((r) => setTimeout(r, 1100));
  }
  return { verifiees };
}
