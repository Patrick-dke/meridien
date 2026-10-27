import { readFileSync } from "node:fs";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

/**
 * Règles Firestore, éprouvées dans l'émulateur (projet fictif) :
 * npm run test:regles
 */
let env: RulesTestEnvironment;

const profil = (email: string, extra: Record<string, unknown> = {}) => ({
  nom: "Awa Ngono",
  nomMinuscule: "awa ngono",
  email,
  emailMinuscule: email.toLowerCase(),
  telephone: "670000000",
  creeLe: "2026-10-27T10:00:00.000Z",
  majLe: "2026-10-27T10:00:00.000Z",
  ...extra,
});

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-meridien-regles",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});
afterAll(() => env?.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, "modules/price-action"), { titre: "Price Action", prix: 40000, gratuit: false, publie: true, ordre: 5 });
    await setDoc(doc(db, "parametres/public"), { paiementOuvert: true });
    await setDoc(doc(db, "parametres/paiement"), { beneficiaire: { numero: "690000000" } });
    await setDoc(doc(db, "contenus/pa-01"), { module: "price-action", chapitreJson: JSON.stringify({ titre: "Secret" }) });
    await setDoc(doc(db, "narrations/pa-01"), { module: "price-action", audio: "…" });
    await setDoc(doc(db, "corriges/pa-01"), { module: "price-action", quizJson: "[]" });
    await setDoc(doc(db, "droits/payeur_price-action"), { uid: "payeur", module: "price-action", actif: true });
    await setDoc(doc(db, "droits/revoque_price-action"), { uid: "revoque", module: "price-action", actif: false });
    await setDoc(doc(db, "utilisateurs/suspendu"), { ...profil("s@x.cm"), statut: "suspendu" });
    await setDoc(doc(db, "droits/suspendu_price-action"), { uid: "suspendu", module: "price-action", actif: true });
    await setDoc(doc(db, "transactions/t1"), { uid: "payeur", module: "price-action", montant: 40000, statut: "reussi" });
    await setDoc(doc(db, "journalAudit/a1"), { acteur: "systeme", action: "paiement.confirme" });
    await setDoc(doc(db, "admins/chef"), { email: "chef@x.cm" });
    await setDoc(doc(db, "messages/m1"), { texte: "Bonjour" });
    await setDoc(doc(db, "certificats/MER-1"), { uid: "payeur", numero: "MER-1" });
  });
});

const anonyme = () => env.unauthenticatedContext().firestore();
const membre = (uid: string, email = `${uid}@x.cm`) => env.authenticatedContext(uid, { email, email_verified: true }).firestore();

describe("catalogue public", () => {
  it("tout le monde lit les prix, personne ne les écrit depuis le navigateur", async () => {
    await assertSucceeds(getDoc(doc(anonyme(), "modules/price-action")));
    await assertFails(updateDoc(doc(membre("payeur"), "modules/price-action"), { prix: 1 }));
    await assertFails(updateDoc(doc(membre("chef"), "modules/price-action"), { prix: 1 }));
  });
  it("les paramètres privés (numéro du bénéficiaire) ne sont jamais lisibles", async () => {
    await assertSucceeds(getDoc(doc(anonyme(), "parametres/public")));
    await assertFails(getDoc(doc(anonyme(), "parametres/paiement")));
    await assertFails(getDoc(doc(membre("chef"), "parametres/paiement")));
  });
  it("un certificat se vérifie par son identifiant", async () => {
    await assertSucceeds(getDoc(doc(anonyme(), "certificats/MER-1")));
    await assertFails(getDocs(collection(anonyme(), "certificats")));
  });
});

describe("contenus payants", () => {
  it("refusés sans compte, sans droit, avec un droit révoqué ou un compte suspendu", async () => {
    await assertFails(getDoc(doc(anonyme(), "contenus/pa-01")));
    await assertFails(getDoc(doc(membre("curieux"), "contenus/pa-01")));
    await assertFails(getDoc(doc(membre("revoque"), "contenus/pa-01")));
    await assertFails(getDoc(doc(membre("suspendu"), "contenus/pa-01")));
    await assertFails(getDoc(doc(membre("curieux"), "narrations/pa-01")));
  });
  it("servis à qui a un droit actif", async () => {
    await assertSucceeds(getDoc(doc(membre("payeur"), "contenus/pa-01")));
    await assertSucceeds(getDoc(doc(membre("payeur"), "narrations/pa-01")));
  });
  it("les corrigés des quiz restent cachés, même à un acheteur", async () => {
    await assertFails(getDoc(doc(membre("payeur"), "corriges/pa-01")));
    await assertSucceeds(getDoc(doc(membre("chef"), "corriges/pa-01")));
  });
  it("seule l'administration publie un contenu", async () => {
    await assertFails(setDoc(doc(membre("payeur"), "contenus/pa-02"), { module: "price-action" }));
    await assertSucceeds(setDoc(doc(membre("chef"), "contenus/pa-02"), { module: "price-action", chapitreJson: "{}" }));
  });
});

describe("argent et droits", () => {
  it("personne ne s'accorde un droit ni ne modifie une transaction", async () => {
    await assertFails(setDoc(doc(membre("curieux"), "droits/curieux_price-action"), { uid: "curieux", module: "price-action", actif: true }));
    await assertFails(setDoc(doc(membre("chef"), "droits/chef_price-action"), { uid: "chef", module: "price-action", actif: true }));
    await assertFails(updateDoc(doc(membre("payeur"), "transactions/t1"), { statut: "echoue" }));
    await assertFails(setDoc(doc(membre("curieux"), "transactions/t2"), { uid: "curieux", statut: "reussi" }));
    await assertFails(setDoc(doc(membre("curieux"), "evaluations/curieux_pa-01"), { uid: "curieux", reussi: true }));
  });
  it("chacun lit ses propres transactions, pas celles des autres", async () => {
    await assertSucceeds(getDoc(doc(membre("payeur"), "transactions/t1")));
    await assertSucceeds(getDocs(query(collection(membre("payeur"), "transactions"), where("uid", "==", "payeur"))));
    await assertFails(getDoc(doc(membre("curieux"), "transactions/t1")));
    await assertFails(getDocs(collection(membre("curieux"), "transactions")));
  });
  it("le journal d'audit est en lecture seule, pour l'administration uniquement", async () => {
    await assertSucceeds(getDoc(doc(membre("chef"), "journalAudit/a1")));
    await assertFails(updateDoc(doc(membre("chef"), "journalAudit/a1"), { action: "falsifie" }));
    await assertFails(deleteDoc(doc(membre("chef"), "journalAudit/a1")));
    await assertFails(getDoc(doc(membre("payeur"), "journalAudit/a1")));
  });
  it("les messages de contact et les limites ne sont pas lisibles depuis le navigateur", async () => {
    await assertFails(getDoc(doc(membre("payeur"), "messages/m1")));
    await assertFails(getDoc(doc(membre("chef"), "messages/m1")));
  });
});

describe("profil et progression", () => {
  it("création du profil avec l'adresse du compte, sans statut ni rôle", async () => {
    await assertSucceeds(setDoc(doc(membre("awa", "awa@x.cm"), "utilisateurs/awa"), profil("awa@x.cm")));
    await assertFails(setDoc(doc(membre("bob", "bob@x.cm"), "utilisateurs/bob"), profil("autre@x.cm")));
    await assertFails(setDoc(doc(membre("eve", "eve@x.cm"), "utilisateurs/eve"), profil("eve@x.cm", { statut: "actif" })));
    await assertFails(setDoc(doc(membre("eve", "eve@x.cm"), "utilisateurs/eve"), profil("eve@x.cm", { role: "admin" })));
    await assertFails(setDoc(doc(membre("eve", "eve@x.cm"), "utilisateurs/eve"), profil("eve@x.cm", { telephone: "237670000000" })));
  });
  it("un utilisateur ne peut ni lever sa suspension ni lire le profil d'un autre", async () => {
    await assertFails(updateDoc(doc(membre("suspendu", "s@x.cm"), "utilisateurs/suspendu"), { statut: "actif" }));
    await assertFails(getDoc(doc(membre("curieux"), "utilisateurs/suspendu")));
  });
  it("la progression est privée et écrite par son propriétaire", async () => {
    const ecrire = (uid: string, cible: string) => setDoc(doc(membre(uid), `progressions/${cible}`), { etat: { version: 1 }, majLe: "2026-10-27" });
    await assertSucceeds(ecrire("awa", "awa"));
    await assertFails(ecrire("awa", "bob"));
    await assertFails(setDoc(doc(membre("awa"), "progressions/awa"), { etat: {}, majLe: "x", reussi: true }));
  });
});
