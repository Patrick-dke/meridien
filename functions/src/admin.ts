import { HttpsError, onCall } from "firebase-functions/v2/https";
import { administrateur, auditer, auth, db, FieldValue, maintenant, REGION } from "./commun";
import { secretsPaiement } from "./config";
import { fournisseurActif, verifierAupresDuPrestataire } from "./paiement/service";
import { reconcilierMaintenant } from "./paiement";
import { masquer, normaliserTelephone } from "./telephone";
import { lireConfig as lireConfigExamen } from "./examens/regles";
import { outilDuCatalogue, OutilSchema } from "./catalogue";
import { cleUnique, creerLicence } from "./licences";
import { normaliserNumeroCompte, normaliserServeur } from "./licences/regles";

/**
 * Grille tarifaire initiale, appliquée seulement aux modules qui n'ont pas encore de prix :
 * rang 1 gratuit, puis 10 000 FCFA par niveau (rang 2 = 10 000, rang 3 = 20 000…).
 * Les prix vivent ensuite en base, modifiables ici ; le site ne les connaît que par la base.
 */
export const PALIER_FCFA = 10_000;
export const prixInitial = (rang: number) => Math.max(0, rang - 1) * PALIER_FCFA;

const texte = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
function motifObligatoire(v: unknown) {
  const m = texte(v, 500);
  if (m.length < 5) throw new HttpsError("invalid-argument", "Indique un motif (5 caractères au moins) : il est inscrit au journal.");
  return m;
}

/** Date ISO ou null (« sans expiration »). */
function dateOuNull(v: unknown) {
  if (v === null || v === undefined || v === "") return null;
  const t = new Date(String(v));
  if (Number.isNaN(t.getTime())) throw new HttpsError("invalid-argument", "Date d'expiration invalide.");
  return t.toISOString();
}

/** Comptes MetaTrader 5 autorisés : numéro et serveur, rien d'autre (aucun mot de passe n'est jamais stocké). */
function lireComptes(v: unknown) {
  const liste = Array.isArray(v) ? v.slice(0, 10) : [];
  return liste.map((c) => {
    const x = (c ?? {}) as Record<string, unknown>;
    const numero = normaliserNumeroCompte(x.numero);
    const serveur = normaliserServeur(x.serveur);
    if (!numero || !serveur) throw new HttpsError("invalid-argument", "Compte invalide : numéro (chiffres) et serveur du courtier.");
    return { numero, serveur };
  });
}

type Contexte = { acteur: string; d: Record<string, unknown> };
type Action = (c: Contexte) => Promise<unknown>;

const lister = async (collection: string, limite = 50, ordre = "creeLe") =>
  (await db.collection(collection).orderBy(ordre, "desc").limit(limite).get()).docs.map((d) => ({ id: d.id, ...d.data() }));

const actions: Record<string, Action> = {
  async statistiques() {
    const [utilisateurs, droits, transactions, demandes, messages] = await Promise.all([
      db.collection("utilisateurs").count().get(),
      db.collection("droits").where("actif", "==", true).get(),
      db.collection("transactions").orderBy("creeLe", "desc").limit(500).get(),
      db.collection("demandesOutils").where("statut", "==", "en_attente").count().get(),
      db.collection("messages").where("statut", "==", "nouveau").count().get(),
    ]);
    const parStatut: Record<string, number> = {};
    let encaisseProduction = 0;
    let encaisseTest = 0;
    for (const t of transactions.docs) {
      parStatut[t.get("statut")] = (parStatut[t.get("statut")] ?? 0) + 1;
      if (t.get("statut") === "reussi" && !t.get("anomalie")) {
        if (t.get("environnement") === "production") encaisseProduction += t.get("montant");
        else encaisseTest += t.get("montant");
      }
    }
    const parModule: Record<string, number> = {};
    for (const d of droits.docs) parModule[d.get("module")] = (parModule[d.get("module")] ?? 0) + 1;
    return {
      utilisateurs: utilisateurs.data().count,
      droitsActifs: droits.size,
      parModule,
      transactions: parStatut,
      aVerifier: transactions.docs.filter((t) => t.get("aVerifier") || t.get("anomalie")).length,
      encaisseProduction,
      encaisseTest,
      demandesEnAttente: demandes.data().count,
      messagesNouveaux: messages.data().count,
      fournisseur: fournisseurActif()?.nom ?? "aucun",
      environnement: fournisseurActif()?.environnement ?? null,
    };
  },

  /* ---------------- Utilisateurs ---------------- */
  async "utilisateurs.rechercher"({ d }) {
    const q = texte(d.q, 120).toLowerCase();
    if (!q) return lister("utilisateurs", 50);
    const resultats = new Map<string, Record<string, unknown>>();
    for (const champ of ["emailMinuscule", "nomMinuscule"]) {
      const s = await db.collection("utilisateurs").where(champ, ">=", q).where(champ, "<=", q + "").limit(25).get();
      s.docs.forEach((x) => resultats.set(x.id, { id: x.id, ...x.data() }));
    }
    const tel = normaliserTelephone(q);
    if (tel) (await db.collection("utilisateurs").where("telephone", "==", tel).limit(10).get()).docs.forEach((x) => resultats.set(x.id, { id: x.id, ...x.data() }));
    return [...resultats.values()];
  },

  async "utilisateurs.fiche"({ d }) {
    const uid = texte(d.uid, 128);
    const compte = await auth.getUser(uid).catch(() => null);
    if (!compte) throw new HttpsError("not-found", "Utilisateur introuvable.");
    const [profil, droits, transactions, evaluations, progression, demandes, admin] = await Promise.all([
      db.doc(`utilisateurs/${uid}`).get(),
      db.collection("droits").where("uid", "==", uid).get(),
      db.collection("transactions").where("uid", "==", uid).get(),
      db.collection("evaluations").where("uid", "==", uid).get(),
      db.doc(`progressions/${uid}`).get(),
      db.collection("demandesOutils").where("uid", "==", uid).get(),
      db.doc(`admins/${uid}`).get(),
    ]);
    const chapitres = (progression.get("etat.chapitres") ?? {}) as Record<string, { statut: string }>;
    return {
      compte: {
        uid,
        email: compte.email,
        emailVerifie: compte.emailVerified,
        fournisseurs: compte.providerData.map((p) => p.providerId),
        desactive: compte.disabled,
        creeLe: compte.metadata.creationTime,
        derniereConnexion: compte.metadata.lastSignInTime,
      },
      admin: admin.exists,
      profil: profil.data() ?? null,
      droits: droits.docs.map((x) => ({ id: x.id, ...x.data() })),
      transactions: transactions.docs.map((x) => ({ id: x.id, ...x.data() }) as { id: string; creeLe?: string }).sort((a, b) => String(b.creeLe).localeCompare(String(a.creeLe))),
      evaluations: evaluations.docs.map((x) => x.data()),
      progression: {
        commences: Object.keys(chapitres).length,
        termines: Object.values(chapitres).filter((c) => c.statut === "termine").length,
        majLe: progression.get("majLe") ?? null,
      },
      demandes: demandes.docs.map((x) => ({ id: x.id, ...x.data() })),
    };
  },

  async "utilisateurs.suspendre"({ acteur, d }) {
    const uid = texte(d.uid, 128);
    const suspendu = d.suspendu === true;
    const motif = motifObligatoire(d.motif);
    if (uid === acteur) throw new HttpsError("failed-precondition", "Tu ne peux pas suspendre ton propre compte.");
    await auth.updateUser(uid, { disabled: suspendu });
    if (suspendu) await auth.revokeRefreshTokens(uid);
    await db.doc(`utilisateurs/${uid}`).set({ statut: suspendu ? "suspendu" : "actif" }, { merge: true });
    await auditer({ acteur, action: suspendu ? "utilisateur.suspendu" : "utilisateur.reactive", cible: uid, motif });
    return { ok: true };
  },

  async "utilisateurs.role"({ acteur, d }) {
    const uid = texte(d.uid, 128);
    const admin = d.admin === true;
    const motif = motifObligatoire(d.motif);
    if (uid === acteur && !admin) throw new HttpsError("failed-precondition", "Un administrateur ne peut pas se retirer ses propres droits.");
    const compte = await auth.getUser(uid);
    if (admin) await db.doc(`admins/${uid}`).set({ email: compte.email ?? null, depuis: maintenant(), nommePar: acteur });
    else await db.doc(`admins/${uid}`).delete();
    await auth.setCustomUserClaims(uid, { ...(compte.customClaims ?? {}), admin });
    await auditer({ acteur, action: admin ? "admin.nomme" : "admin.retire", cible: uid, motif });
    return { ok: true };
  },

  /* ---------------- Droits d'accès ---------------- */
  async "droits.accorder"({ acteur, d }) {
    const uid = texte(d.uid, 128);
    const idModule = texte(d.module, 60);
    const motif = motifObligatoire(d.motif);
    if (!(await db.doc(`modules/${idModule}`).get()).exists) throw new HttpsError("not-found", "Module inconnu.");
    await db.doc(`droits/${uid}_${idModule}`).set({ uid, module: idModule, actif: true, source: "administration", accordePar: acteur, accordeLe: maintenant(), motif });
    await auditer({ acteur, action: "droit.accorde", cible: `${uid}_${idModule}`, motif });
    return { ok: true };
  },

  async "droits.revoquer"({ acteur, d }) {
    const id = `${texte(d.uid, 128)}_${texte(d.module, 60)}`;
    const motif = motifObligatoire(d.motif);
    await db.doc(`droits/${id}`).update({ actif: false, revoqueLe: maintenant(), revoquePar: acteur, motifRevocation: motif });
    await auditer({ acteur, action: "droit.revoque", cible: id, motif });
    return { ok: true };
  },

  /* ---------------- Modules et prix ---------------- */
  async "modules.lister"() {
    const [modules, droits] = await Promise.all([db.collection("modules").orderBy("ordre").get(), db.collection("droits").where("actif", "==", true).get()]);
    const acheteurs: Record<string, number> = {};
    for (const x of droits.docs) acheteurs[x.get("module")] = (acheteurs[x.get("module")] ?? 0) + 1;
    return modules.docs.map((m) => ({ id: m.id, ...m.data(), acheteurs: acheteurs[m.id] ?? 0 }));
  },

  /** Crée les modules absents de la base à partir de la structure du catalogue, avec la grille initiale. */
  async "modules.initialiser"({ acteur, d }) {
    const liste = Array.isArray(d.modules) ? (d.modules as Record<string, unknown>[]).slice(0, 30) : [];
    const crees: string[] = [];
    for (const m of liste) {
      const id = texte(m.id, 60);
      const rang = Number(m.rang);
      if (!/^[a-z0-9-]+$/.test(id) || !Number.isInteger(rang) || rang < 1) continue;
      const ref = db.doc(`modules/${id}`);
      if ((await ref.get()).exists) continue;
      const gratuit = m.gratuit === true;
      await ref.set({ titre: texte(m.titre, 120), rang, ordre: rang, gratuit, prix: gratuit ? 0 : prixInitial(rang), devise: "XAF", publie: true, modifieLe: maintenant(), modifiePar: acteur });
      crees.push(id);
    }
    if (crees.length) await auditer({ acteur, action: "modules.initialises", cible: "modules", details: { crees } });
    return { crees };
  },

  async "modules.modifier"({ acteur, d }) {
    const id = texte(d.id, 60);
    const ref = db.doc(`modules/${id}`);
    const avant = await ref.get();
    if (!avant.exists) throw new HttpsError("not-found", "Module inconnu.");
    const champs = (d.champs ?? {}) as Record<string, unknown>;
    const maj: Record<string, unknown> = {};
    if ("prix" in champs) {
      const prix = Number(champs.prix);
      if (!Number.isInteger(prix) || prix < 0 || prix > 5_000_000) throw new HttpsError("invalid-argument", "Prix en FCFA entier, entre 0 et 5 000 000.");
      if (!avant.get("gratuit") && prix > 0 && prix < 100) throw new HttpsError("invalid-argument", "Le Mobile Money exige au moins 100 FCFA.");
      maj.prix = prix;
    }
    if ("publie" in champs) maj.publie = champs.publie === true;
    if ("ordre" in champs && Number.isInteger(champs.ordre)) maj.ordre = champs.ordre;
    if ("titre" in champs && texte(champs.titre, 120)) maj.titre = texte(champs.titre, 120);
    if ("accroche" in champs) maj.accroche = texte(champs.accroche, 300);
    if (!Object.keys(maj).length) return { ok: true };
    const motif = "prix" in maj ? motifObligatoire(d.motif) : texte(d.motif);
    await ref.update({ ...maj, modifieLe: maintenant(), modifiePar: acteur });
    const precedent = Object.fromEntries(Object.keys(maj).map((k) => [k, avant.get(k) ?? null]));
    await auditer({ acteur, action: "module.modifie", cible: id, details: { avant: precedent, apres: maj }, motif });
    return { ok: true };
  },

  /* ---------------- Paramètres ---------------- */
  async "parametres.lire"() {
    const [pub, paiement, outils, contact, examens] = await db.getAll(
      db.doc("parametres/public"),
      db.doc("parametres/paiement"),
      db.doc("parametres/outils"),
      db.doc("parametres/contact"),
      db.doc("parametres/examens"),
    );
    const f = fournisseurActif();
    return {
      public: pub.data() ?? {},
      paiement: paiement.data() ?? {},
      outils: outils.data() ?? {},
      contact: contact.data() ?? {},
      examens: lireConfigExamen(examens.data()),
      serveur: { fournisseur: f?.nom ?? "aucun", environnement: f?.environnement ?? null },
    };
  },

  async "parametres.modifier"({ acteur, d }) {
    const section = texte(d.section, 20);
    const v = (d.valeurs ?? {}) as Record<string, unknown>;
    let donnees: Record<string, unknown>;
    let journal: Record<string, unknown>;
    switch (section) {
      case "beneficiaire": {
        const numero = v.numero ? normaliserTelephone(String(v.numero)) : null;
        if (v.numero && !numero) throw new HttpsError("invalid-argument", "Numéro camerounais attendu (9 chiffres commençant par 6).");
        const beneficiaire = {
          prestataire: texte(v.prestataire, 40),
          operateur: v.operateur === "orange" ? "orange" : v.operateur === "mtn" ? "mtn" : "les-deux",
          nom: texte(v.nom, 120),
          compteMarchand: texte(v.compteMarchand, 80),
          numero,
          statut: ["a_configurer", "en_verification", "actif", "suspendu"].includes(String(v.statut)) ? v.statut : "a_configurer",
        };
        donnees = { beneficiaire, modifieLe: maintenant(), modifiePar: acteur };
        await db.doc("parametres/paiement").set(donnees, { merge: true });
        journal = { ...beneficiaire, numero: numero ? masquer(numero) : null };
        break;
      }
      case "paiement": {
        donnees = { paiementOuvert: v.paiementOuvert === true, modifieLe: maintenant() };
        await db.doc("parametres/public").set(donnees, { merge: true });
        journal = donnees;
        break;
      }
      case "outils": {
        const scoreMin = Number(v.scoreMin);
        donnees = {
          modulesRequis: Array.isArray(v.modulesRequis) ? v.modulesRequis.map((x) => texte(x, 60)).filter(Boolean) : [],
          scoreMin: scoreMin >= 0.5 && scoreMin <= 1 ? scoreMin : 0.8,
          ...(v.outils && typeof v.outils === "object" ? { outils: v.outils } : {}),
        };
        await db.doc("parametres/outils").set(donnees, { merge: true });
        journal = donnees;
        break;
      }
      case "examens": {
        const c = lireConfigExamen(v);
        if (c.connaissance + c.application + c.transfert < 5) throw new HttpsError("invalid-argument", "Un examen compte au moins 5 questions.");
        donnees = { ...c, modifieLe: maintenant(), modifiePar: acteur };
        await db.doc("parametres/examens").set(donnees);
        journal = c;
        break;
      }
      case "contact": {
        donnees = {
          email: texte(v.email, 120) || null,
          whatsapp: { actif: v.whatsappActif === true, numero: v.whatsappNumero ? normaliserTelephone(String(v.whatsappNumero)) : null },
        };
        await db.doc("parametres/contact").set(donnees, { merge: true });
        // Seules les coordonnées que l'équipe choisit de publier sont recopiées dans les paramètres publics.
        await db.doc("parametres/public").set({ contact: { email: donnees.email, whatsapp: v.whatsappPublic === true ? (donnees.whatsapp as { numero: string | null }).numero : null } }, { merge: true });
        journal = { email: donnees.email, whatsappActif: v.whatsappActif === true };
        break;
      }
      default:
        throw new HttpsError("invalid-argument", "Section inconnue.");
    }
    await auditer({ acteur, action: `parametres.${section}`, cible: section, details: journal, motif: texte(d.motif) });
    return { ok: true };
  },

  /* ---------------- Paiements ---------------- */
  async "transactions.lister"({ d }) {
    let q = db.collection("transactions").orderBy("creeLe", "desc").limit(Math.min(Number(d.limite) || 100, 300));
    if (typeof d.statut === "string" && d.statut) q = db.collection("transactions").where("statut", "==", d.statut).orderBy("creeLe", "desc").limit(100);
    return (await q.get()).docs.map((x) => ({ id: x.id, ...x.data() }));
  },

  async "transactions.verifier"({ acteur, d }) {
    const id = texte(d.id, 64);
    const statut = await verifierAupresDuPrestataire(id, "administration");
    await auditer({ acteur, action: "paiement.reverifie", cible: id, details: { statut } });
    return { statut };
  },

  async "transactions.reconcilier"({ acteur }) {
    const r = await reconcilierMaintenant();
    await auditer({ acteur, action: "paiement.reconciliation_manuelle", cible: "transactions", details: r });
    return r;
  },

  /**
   * Résolution contrôlée d'un paiement litigieux (webhook perdu, prestataire injoignable, montant contesté).
   * L'historique n'est jamais réécrit : la décision s'ajoute, avec son auteur, son motif et la preuve citée.
   */
  async "transactions.resoudre"({ acteur, d }) {
    const id = texte(d.id, 64);
    const decision = d.decision === "accorder_acces" ? "accorder_acces" : d.decision === "classer" ? "classer" : null;
    if (!decision) throw new HttpsError("invalid-argument", "Décision attendue : accorder_acces ou classer.");
    const motif = motifObligatoire(d.motif);
    const preuve = texte(d.preuve, 200);
    if (decision === "accorder_acces" && preuve.length < 4) throw new HttpsError("invalid-argument", "Cite la référence de l'opération chez le prestataire ou l'opérateur.");
    const ref = db.doc(`transactions/${id}`);
    await db.runTransaction(async (t) => {
      const tx = await t.get(ref);
      if (!tx.exists) throw new HttpsError("not-found", "Transaction introuvable.");
      const date = maintenant();
      t.update(ref, { resolutions: FieldValue.arrayUnion({ decision, motif, preuve, par: acteur, date }), aVerifier: false });
      if (decision === "accorder_acces") {
        t.set(db.doc(`droits/${tx.get("uid")}_${tx.get("module")}`), {
          uid: tx.get("uid"),
          module: tx.get("module"),
          actif: true,
          source: "resolution",
          transaction: id,
          accordePar: acteur,
          accordeLe: date,
          motif,
          test: tx.get("environnement") === "test",
        });
      }
      auditer({ acteur, action: `paiement.resolution.${decision}`, cible: id, details: { statutPrestataire: tx.get("statut"), preuve }, motif }, t);
    });
    return { ok: true };
  },

  /* ---------------- Outils MT5, messages, journal ---------------- */
  async "demandes.lister"() {
    return lister("demandesOutils", 100);
  },

  async "demandes.traiter"({ acteur, d }) {
    const id = texte(d.id, 200);
    const decision = d.decision === "accordee" ? "accordee" : d.decision === "refusee" ? "refusee" : null;
    if (!decision) throw new HttpsError("invalid-argument", "Décision attendue : accordee ou refusee.");
    const note = texte(d.note, 1000);
    const ref = db.doc(`demandesOutils/${id}`);
    const demande = await ref.get();
    if (!demande.exists) throw new HttpsError("not-found", "Demande introuvable.");
    if (demande.get("statut") === "accordee") throw new HttpsError("failed-precondition", "Demande déjà accordée.");
    const expireLe = dateOuNull(d.expireLe);
    const maj: Record<string, unknown> = { statut: decision, noteAdmin: note || null, traiteLe: maintenant(), traitePar: acteur };
    if (decision === "accordee") {
      const outil = await outilDuCatalogue(String(demande.get("outil")));
      if (outil?.categorie === "robot") {
        // Robot : la licence reprend les comptes de la demande ; l'installation autonome permet l'ajout au premier lancement.
        const details = (demande.get("details") ?? {}) as { comptes?: { numero: string; serveur: string }[]; installation?: string };
        const comptes = details.comptes ?? [];
        maj.licence = await creerLicence({
          uid: demande.get("uid"),
          email: demande.get("email"),
          outil: outil.id,
          comptes,
          maxComptes: Number(d.maxComptes) || Math.max(1, comptes.length),
          activationAuto: details.installation === "autonome",
          expireLe,
          note,
          demande: id,
          acteur,
        });
      } else {
        // Indicateur TradingView : l'accès s'ouvre à la main sur TradingView (« Manage access ») avant de valider ici.
        const details = (demande.get("details") ?? {}) as { identifiantTradingView?: string };
        maj.acces = { identifiantTradingView: details.identifiantTradingView ?? null, expireLe, ouvertLe: maintenant() };
      }
    }
    await ref.update(maj);
    await auditer({ acteur, action: `outil.${decision}`, cible: id, motif: note, ...(maj.licence ? { details: { licence: maj.licence } } : {}) });
    return { ok: true, licence: maj.licence ?? null };
  },

  /* ---------------- Catalogue des outils ---------------- */
  async "catalogue.lister"() {
    return (await db.collection("catalogueOutils").orderBy("ordre").get()).docs.map((x) => ({ ...x.data(), id: x.id }));
  },
  async "catalogue.enregistrer"({ acteur, d }) {
    const r = OutilSchema.safeParse(d.outil);
    if (!r.success) throw new HttpsError("invalid-argument", `Fiche invalide : ${r.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join(" ; ")}`);
    const { id, ...fiche } = r.data;
    const avant = await db.doc(`catalogueOutils/${id}`).get();
    await db.doc(`catalogueOutils/${id}`).set({ ...fiche, modifieLe: maintenant(), modifiePar: acteur });
    await auditer({
      acteur,
      action: avant.exists ? "catalogue.modification" : "catalogue.creation",
      cible: id,
      details: { statut: fiche.statut, prix: fiche.prix, prixAvant: avant.get("prix") ?? null, modesAcces: fiche.modesAcces, publie: fiche.publie },
      motif: texte(d.motif),
    });
    return { ok: true };
  },

  /* ---------------- Licences ---------------- */
  async "examens.lister"({ d }) {
    const idMod = texte(d.module, 60);
    // Filtre par module trié en mémoire : pas d'index composite à maintenir pour quelques centaines de résultats.
    const q = idMod ? db.collection("examens").where("module", "==", idMod).limit(500) : db.collection("examens").orderBy("date", "desc").limit(200);
    const lignes = (await q.get()).docs.map((x) => x.data()).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const uids = [...new Set(lignes.map((l) => l.uid as string))];
    const profils = uids.length ? await db.getAll(...uids.map((u) => db.doc(`utilisateurs/${u}`))) : [];
    const noms = new Map(profils.map((p) => [p.id, (p.get("nom") as string | undefined) ?? (p.get("email") as string | undefined) ?? p.id]));
    return lignes.map((l) => ({
      uid: l.uid,
      nom: noms.get(l.uid) ?? l.uid,
      module: l.module,
      meilleurScore: l.meilleurScore,
      dernierScore: l.dernierScore,
      tentatives: l.tentatives,
      reussi: l.reussi,
      aRevoir: ((l.aRevoir as { slug: string }[] | undefined) ?? []).map((c) => c.slug),
      date: l.date,
    }));
  },
  async "licences.lister"({ d }) {
    const uid = texte(d.uid, 128);
    const q = uid ? db.collection("licences").where("uid", "==", uid) : db.collection("licences").orderBy("creeLe", "desc").limit(200);
    return (await q.get()).docs.map((x) => ({ id: x.id, ...x.data() }));
  },
  async "licences.creer"({ acteur, d }) {
    let uid = texte(d.uid, 128);
    const email = texte(d.email, 200).toLowerCase();
    if (!uid && email) uid = (await auth.getUserByEmail(email).catch(() => null))?.uid ?? "";
    if (!uid) throw new HttpsError("invalid-argument", "Compte introuvable : indique l'adresse ou l'identifiant de l'utilisateur.");
    const outil = await outilDuCatalogue(texte(d.outil, 40));
    if (!outil || outil.categorie !== "robot") throw new HttpsError("invalid-argument", "Les licences concernent les robots MetaTrader 5.");
    const id = await creerLicence({
      uid,
      email: email || (await auth.getUser(uid).catch(() => null))?.email || null,
      outil: outil.id,
      comptes: lireComptes(d.comptes),
      maxComptes: Number(d.maxComptes) || 1,
      activationAuto: d.activationAuto === true,
      expireLe: dateOuNull(d.expireLe),
      note: texte(d.note, 500) || null,
      acteur,
    });
    return { id };
  },
  async "licences.modifier"({ acteur, d }) {
    const id = texte(d.id, 64);
    const ref = db.doc(`licences/${id}`);
    const avant = await ref.get();
    if (!avant.exists) throw new HttpsError("not-found", "Licence introuvable.");
    const motif = motifObligatoire(d.motif);
    const maj: Record<string, unknown> = { majLe: maintenant(), majPar: acteur };
    if (d.statut !== undefined) {
      if (!["active", "suspendue", "revoquee"].includes(String(d.statut))) throw new HttpsError("invalid-argument", "Statut : active, suspendue ou revoquee.");
      if (avant.get("statut") === "revoquee") throw new HttpsError("failed-precondition", "Une licence révoquée ne se réactive pas : crée-en une nouvelle.");
      maj.statut = d.statut;
    }
    if (d.comptes !== undefined) maj.comptes = lireComptes(d.comptes).map((c) => ({ ...c, ajouteLe: maintenant() }));
    if (d.maxComptes !== undefined) maj.maxComptes = Math.max(1, Math.min(10, Number(d.maxComptes) || 1));
    if (d.activationAuto !== undefined) maj.activationAuto = d.activationAuto === true;
    if (d.expireLe !== undefined) maj.expireLe = dateOuNull(d.expireLe);
    if (d.note !== undefined) maj.note = texte(d.note, 500) || null;
    if (d.telechargement !== undefined) {
      const lien = texte(d.telechargement, 500);
      if (lien && !/^https:\/\/[^\s]+$/.test(lien)) throw new HttpsError("invalid-argument", "Lien de téléchargement : une adresse https:// attendue.");
      maj.telechargement = lien || null;
    }
    const regeneree = d.regenerer === true;
    if (regeneree) maj.cle = await cleUnique();
    await ref.update(maj);
    const journal = Object.fromEntries(Object.entries(maj).filter(([k]) => !["majLe", "majPar", "cle"].includes(k)));
    await auditer({ acteur, action: "licence.modification", cible: id, details: { ...journal, cleRegeneree: regeneree }, motif });
    return { ok: true };
  },

  async "messages.lister"() {
    return lister("messages", 100);
  },

  async "messages.traiter"({ acteur, d }) {
    const id = texte(d.id, 64);
    const statut = ["nouveau", "lu", "traite"].includes(String(d.statut)) ? String(d.statut) : "lu";
    await db.doc(`messages/${id}`).update({ statut, traiteLe: maintenant(), traitePar: acteur });
    return { ok: true };
  },

  async "journal.lister"({ d }) {
    let q = db.collection("journalAudit").orderBy("date", "desc").limit(Math.min(Number(d.limite) || 100, 300));
    if (typeof d.cible === "string" && d.cible) q = db.collection("journalAudit").where("cible", "==", d.cible).orderBy("date", "desc").limit(100);
    return (await q.get()).docs.map((x) => ({ id: x.id, ...x.data() }));
  },

  async "contenus.journaliser"({ acteur, d }) {
    await auditer({ acteur, action: "contenus.publies", cible: "contenus", details: { version: texte(d.version, 40), contenus: Number(d.contenus) || 0, narrations: Number(d.narrations) || 0 } });
    return { ok: true };
  },

  async "contenus.etat"() {
    const s = await db.collection("contenus").select("module", "version", "publieLe", "titre").get();
    return s.docs.map((x) => ({ slug: x.id, ...x.data() }));
  },
};

/** Point d'entrée unique de l'administration : chaque action vérifie le rôle, et les écritures sont journalisées. */
export const admin = onCall({ region: REGION, secrets: secretsPaiement, timeoutSeconds: 120 }, async (req) => {
  const acteur = await administrateur(req);
  const nom = String(req.data?.action ?? "");
  const action = actions[nom];
  if (!action) throw new HttpsError("invalid-argument", `Action inconnue : ${nom}`);
  return action({ acteur, d: (req.data ?? {}) as Record<string, unknown> });
});
