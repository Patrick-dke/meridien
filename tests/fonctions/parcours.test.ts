import { createRequire } from "node:module";
import { join } from "node:path";
import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, doc, getDoc, getFirestore, setDoc, type Firestore } from "firebase/firestore/lite";
import { connectFunctionsEmulator, getFunctions, httpsCallable, type Functions } from "firebase/functions";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COMPTES_TEST } from "../../scripts/emulateurs/comptes";

/**
 * Parcours complet dans l'environnement de TEST (émulateurs, paiements simulés) :
 * inscription → contenu refusé → paiement échoué → paiement réussi → contenu servi → quiz noté par le serveur,
 * plus les garde-fous (idempotence, anti-doublon, webhook non authentifié, administration réservée).
 * Lancement : npm run test:fonctions
 */
const PROJET = "demo-meridien";
const HOTE = "127.0.0.1";
const MODULE = "price-action";
const exiger = createRequire(join(process.cwd(), "functions", "package.json"));
const admin = exiger("firebase-admin/app") as typeof import("../../functions/node_modules/firebase-admin/lib/app/index");
const adminFs = exiger("firebase-admin/firestore") as typeof import("../../functions/node_modules/firebase-admin/lib/firestore/index");
process.env.FIRESTORE_EMULATOR_HOST ??= `${HOTE}:8080`;
const dbAdmin = adminFs.getFirestore(admin.getApps()[0] ?? admin.initializeApp({ projectId: PROJET }));

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let fn: Functions;
const appeler = <R = Record<string, unknown>>(nom: string, d?: unknown) => httpsCallable(fn, nom)(d).then((r) => r.data as R);
const code = (p: Promise<unknown>) => p.then(() => "ok", (e: { code?: string }) => e.code);
const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function attendreStatut(transaction: string) {
  for (let i = 0; i < 15; i++) {
    const r = await appeler<{ statut: string }>("verifierPaiement", { transaction });
    if (r.statut !== "en_attente") return r.statut;
    await attendre(2000);
  }
  return "en_attente";
}

const email = `eleve-${Date.now()}@meridien.test`;
let uid = "";
let slugPayant = "";

beforeAll(async () => {
  app = initializeApp({ apiKey: "demo-cle", projectId: PROJET, appId: "test" }, `test-${Date.now()}`);
  auth = getAuth(app);
  connectAuthEmulator(auth, `http://${HOTE}:9099`, { disableWarnings: true });
  db = getFirestore(app);
  connectFirestoreEmulator(db, HOTE, 8080);
  fn = getFunctions(app, "europe-west1");
  connectFunctionsEmulator(fn, HOTE, 5001);
  const premier = await dbAdmin.collection("contenus").where("module", "==", MODULE).limit(1).get();
  slugPayant = premier.docs[0]?.id ?? "";
});
afterAll(() => deleteApp(app));

describe("parcours d'achat simulé", () => {
  it("l'environnement de test est amorcé (prix en base, grille initiale)", async () => {
    expect(slugPayant).not.toBe("");
    const m = await dbAdmin.doc(`modules/${MODULE}`).get();
    expect(m.get("prix")).toBe((m.get("rang") - 1) * 10_000);
    const etat = await appeler<{ ouvert: boolean; environnement: string; simulation: boolean }>("etatPaiement");
    expect(etat).toMatchObject({ ouvert: true, environnement: "test", simulation: true });
  });

  it("inscription : un compte neuf n'a pas accès au contenu payant ni à son quiz", async () => {
    const { user } = await createUserWithEmailAndPassword(auth, email, "MotDePasse-test-1");
    uid = user.uid;
    const date = new Date().toISOString();
    await setDoc(doc(db, "utilisateurs", uid), { nom: "Élève Test", nomMinuscule: "élève test", email, emailMinuscule: email, telephone: "670000000", photo: null, creeLe: date, majLe: date });
    expect(await code(getDoc(doc(db, "contenus", slugPayant)))).toBe("permission-denied");
    expect(await code(appeler("noterQuiz", { slug: slugPayant, reponses: [] }))).toBe("functions/permission-denied");
  });

  it("paiement refusé tant que l'adresse e-mail n'est pas vérifiée", async () => {
    expect(await code(appeler("initierPaiement", { module: MODULE, operateur: "mtn", telephone: "670000000", cle: "cle-test-0000000000000" }))).toBe("functions/failed-precondition");
    const rep = await fetch(`http://${HOTE}:9099/identitytoolkit.googleapis.com/v1/projects/${PROJET}/accounts:update`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer owner" },
      body: JSON.stringify({ localId: uid, emailVerified: true }),
    });
    expect(rep.ok).toBe(true);
    await auth.currentUser!.getIdToken(true);
  });

  it("numéro incohérent avec l'opérateur, ou étranger : refusé avant tout appel au prestataire", async () => {
    expect(await code(appeler("initierPaiement", { module: MODULE, operateur: "orange", telephone: "670000000", cle: "cle-test-incoherent-01" }))).toBe("functions/invalid-argument");
    expect(await code(appeler("initierPaiement", { module: MODULE, operateur: "mtn", telephone: "+33612345678", cle: "cle-test-etranger-0001" }))).toBe("functions/invalid-argument");
  });

  it("paiement échoué : aucun accès, statut final « échoué »", async () => {
    const r = await appeler<{ transaction: string; statut: string; environnement: string }>("initierPaiement", { module: MODULE, operateur: "mtn", telephone: "670000001", cle: "cle-test-echec-000001" });
    expect(r).toMatchObject({ statut: "en_attente", environnement: "test" });
    expect(await attendreStatut(r.transaction)).toBe("echoue");
    expect((await dbAdmin.doc(`droits/${uid}_${MODULE}`).get()).exists).toBe(false);
  }, 60_000);

  it("paiement réussi : idempotent, sans doublon, et l'accès ne vient que de la confirmation serveur", async () => {
    const demande = { module: MODULE, operateur: "orange", telephone: "690000000", cle: "cle-test-succes-00001" };
    const r = await appeler<{ transaction: string }>("initierPaiement", demande);
    // Même clé : même transaction, aucun nouvel appel au prestataire.
    const bis = await appeler<{ transaction: string }>("initierPaiement", demande);
    expect(bis.transaction).toBe(r.transaction);
    // Autre clé pendant l'attente : la transaction en cours est renvoyée, pas une nouvelle.
    const autre = await appeler<{ transaction: string; dejaEnCours?: boolean }>("initierPaiement", { ...demande, cle: "cle-test-succes-00002" });
    expect(autre).toMatchObject({ transaction: r.transaction, dejaEnCours: true });
    // Tant que le prestataire n'a pas confirmé, rien n'est ouvert.
    expect(await code(getDoc(doc(db, "contenus", slugPayant)))).toBe("permission-denied");

    expect(await attendreStatut(r.transaction)).toBe("reussi");
    const droit = await dbAdmin.doc(`droits/${uid}_${MODULE}`).get();
    expect(droit.data()).toMatchObject({ actif: true, source: "paiement", transaction: r.transaction, test: true });
    const tx = await dbAdmin.doc(`transactions/${r.transaction}`).get();
    expect(tx.get("historique").map((h: { statut: string }) => h.statut)).toEqual(["initialisation", "en_attente", "reussi"]);
    const commande = await dbAdmin.doc(`commandes/${tx.get("commande")}`).get();
    expect(commande.get("statut")).toBe("payee");
    const journal = await dbAdmin.collection("journalAudit").where("cible", "==", r.transaction).get();
    expect(journal.docs.map((d) => d.get("action"))).toEqual(expect.arrayContaining(["paiement.initie", "paiement.confirme"]));
  }, 60_000);

  it("après paiement : contenu servi, rachat refusé, quiz noté par le serveur", async () => {
    const c = await getDoc(doc(db, "contenus", slugPayant));
    expect(c.exists()).toBe(true);
    expect(await code(getDoc(doc(db, "corriges", slugPayant)))).toBe("permission-denied");
    expect(await code(appeler("initierPaiement", { module: MODULE, operateur: "mtn", telephone: "670000000", cle: "cle-test-rachat-000001" }))).toBe("functions/already-exists");

    const quiz = JSON.parse(c.get("chapitreJson")).quiz as { type: string; bonne?: number; bonnes?: number[]; reponse?: boolean; paires?: unknown[]; etapes?: unknown[] }[];
    const justes = quiz.map((q) =>
      q.type === "unique" ? { type: "unique", choix: q.bonne } : q.type === "multiple" ? { type: "multiple", choix: q.bonnes } : q.type === "vraifaux" ? { type: "vraifaux", valeur: q.reponse } : q.type === "association" ? { type: "association", choix: q.paires!.map((_, i) => i) } : { type: "ordre", ordre: q.etapes!.map((_, i) => i) },
    );
    const r = await appeler<{ score: number; reussi: boolean }>("noterQuiz", { slug: slugPayant, reponses: justes });
    expect(r).toMatchObject({ score: 1, reussi: true });
    const faux = await appeler<{ score: number }>("noterQuiz", { slug: slugPayant, reponses: justes.map(() => ({ type: "unique", choix: 99 })) });
    expect(faux.score).toBe(0);
    const ev = await dbAdmin.doc(`evaluations/${uid}_${slugPayant}`).get();
    expect(ev.data()).toMatchObject({ meilleurScore: 1, reussi: true, tentatives: 2 });
  });
});

describe("webhook du prestataire", () => {
  it("authentifié, il ne croit pas le message : le statut est relu auprès du prestataire", async () => {
    // Un compte neuf, vérifié, qui paie un autre module.
    const autre = `webhook-${Date.now()}@meridien.test`;
    const { user } = await createUserWithEmailAndPassword(auth, autre, "MotDePasse-test-2");
    await fetch(`http://${HOTE}:9099/identitytoolkit.googleapis.com/v1/projects/${PROJET}/accounts:update`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer owner" },
      body: JSON.stringify({ localId: user.uid, emailVerified: true }),
    });
    await user.getIdToken(true);
    // Numéro de test qui ÉCHOUE chez le prestataire : un message prétendant « SUCCESSFUL » ne doit rien débloquer.
    const r = await appeler<{ transaction: string }>("initierPaiement", { module: "analyse-technique", operateur: "mtn", telephone: "670000003", cle: "cle-test-webhook-00001" });
    const idFournisseur = (await dbAdmin.doc(`transactions/${r.transaction}`).get()).get("idFournisseur");
    const notifier = (corps: Record<string, unknown>) =>
      fetch(`http://${HOTE}:5001/${PROJET}/europe-west1/webhookPaiement`, { method: "POST", headers: { "content-type": "application/json", "x-wh-secret": "secret-webhook-emulateur" }, body: JSON.stringify(corps) }).then((x) => x.json());
    const premier = await notifier({ transId: idFournisseur, status: "SUCCESSFUL", amount: 30000 });
    expect(["en_attente", "echoue"]).toContain(premier.statut);
    await attendre(7000);
    expect(await notifier({ transId: idFournisseur, status: "SUCCESSFUL" })).toMatchObject({ statut: "echoue" });
    expect((await dbAdmin.doc(`droits/${user.uid}_analyse-technique`).get()).exists).toBe(false);
    const tx = await dbAdmin.doc(`transactions/${r.transaction}`).get();
    expect(tx.get("historique").at(-1)).toMatchObject({ statut: "echoue", source: "webhook" });
    await signOut(auth);
    await signInWithEmailAndPassword(auth, email, "MotDePasse-test-1");
  }, 60_000);
});

describe("garde-fous", () => {
  it("un webhook sans le bon secret est refusé", async () => {
    const rep = await fetch(`http://${HOTE}:5001/${PROJET}/europe-west1/webhookPaiement`, { method: "POST", headers: { "content-type": "application/json", "x-wh-secret": "mauvais" }, body: JSON.stringify({ transId: "x" }) });
    expect(rep.status).toBe(401);
  });

  it("l'administration est refusée à un apprenant et ouverte à un administrateur", async () => {
    expect(await code(appeler("admin", { action: "statistiques" }))).toBe("functions/permission-denied");
    // Une adresse vérifiée mais absente de ADMIN_EMAILS ne peut pas se déclarer administrateur.
    expect(await code(appeler("revendiquerAdmin"))).toBe("functions/permission-denied");
    await signOut(auth);
    await signInWithEmailAndPassword(auth, COMPTES_TEST.admin.email, COMPTES_TEST.admin.motDePasse);
    const s = await appeler<{ fournisseur: string; environnement: string }>("admin", { action: "statistiques" });
    expect(s).toMatchObject({ fournisseur: "simulation", environnement: "test" });
  });

  it("un changement de prix exige un motif et laisse une trace au journal", async () => {
    expect(await code(appeler("admin", { action: "modules.modifier", id: MODULE, champs: { prix: 45_000 } }))).toBe("functions/invalid-argument");
    await appeler("admin", { action: "modules.modifier", id: MODULE, champs: { prix: 45_000 }, motif: "Essai de modification en test" });
    expect((await dbAdmin.doc(`modules/${MODULE}`).get()).get("prix")).toBe(45_000);
    const j = await dbAdmin.collection("journalAudit").where("cible", "==", MODULE).get();
    expect(j.docs.some((d) => d.get("action") === "module.modifie" && d.get("details.apres.prix") === 45_000)).toBe(true);
    await appeler("admin", { action: "modules.modifier", id: MODULE, champs: { prix: 40_000 }, motif: "Retour à la grille initiale" });
  });

  it("le contact fonctionne sans compte et rejette les robots", async () => {
    await signOut(auth);
    const r = await appeler<{ ok: boolean; reference?: string }>("envoyerMessage", { nom: "Visiteur", email: "visiteur@exemple.cm", sujet: "formation", texte: "Bonjour, une question sur les formations." });
    expect(r.ok).toBe(true);
    expect(r.reference).toBeTruthy();
    const robot = await appeler<{ ok: boolean; reference?: string }>("envoyerMessage", { nom: "Robot", email: "r@exemple.cm", sujet: "autre", texte: "Message automatique !!", site: "x" });
    expect(robot.reference).toBeUndefined();
  });
});
