import { readFileSync } from "node:fs";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, deleteDoc, writeBatch, serverTimestamp, type Firestore } from "firebase/firestore";
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
  it("tout le monde lit les prix, personne ne les écrit depuis le navigateur sans trace au journal", async () => {
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

describe("administration sans fonctions serveur", () => {
  const DATE = "2026-11-03T22:00:00.000Z";
  type Options = { acteur?: string; journal?: string; sansJournal?: boolean; horodatage?: unknown; motif?: string };
  // Le contexte de test fournit une instance « compat » : writeBatch attend le type modulaire.
  type Db = ReturnType<typeof membre>;
  const lotDe = (db: Db) => writeBatch(db as unknown as Firestore);
  /** Accorde un droit comme le fait l'administration : le droit et sa trace dans le même lot. */
  const accorder = (db: Db, uid: string, module: string, o: Options = {}) => {
    const lot = lotDe(db);
    const j = doc(collection(db, "journalAudit"));
    const id = `${uid}_${module}`;
    lot.set(doc(db, "droits", id), {
      uid,
      module,
      actif: true,
      source: "administration",
      accordePar: "chef",
      accordeLe: DATE,
      motif: o.motif ?? "Geste commercial",
      journal: o.journal ?? j.id,
    });
    if (!o.sansJournal)
      lot.set(j, {
        acteur: o.acteur ?? "chef",
        action: "droit.accorde",
        cible: id,
        motif: "Geste commercial",
        date: DATE,
        horodatage: o.horodatage ?? serverTimestamp(),
      });
    return lot.commit();
  };
  const revoquer = (db: Db, id: string, extra: Record<string, unknown> = {}) => {
    const lot = lotDe(db);
    const j = doc(collection(db, "journalAudit"));
    lot.update(doc(db, "droits", id), {
      actif: false,
      revoqueLe: DATE,
      revoquePar: "chef",
      motifRevocation: "Remboursement",
      journalRevocation: j.id,
      ...extra,
    });
    lot.set(j, { acteur: "chef", action: "droit.revoque", cible: id, motif: "Remboursement", date: DATE, horodatage: serverTimestamp() });
    return lot.commit();
  };
  const creerModule = (db: Db, id: string, prix: number) => {
    const lot = lotDe(db);
    const j = doc(collection(db, "journalAudit"));
    lot.set(doc(db, "modules", id), {
      titre: "Smart Money Concepts",
      rang: 7,
      ordre: 7,
      gratuit: false,
      prix,
      devise: "XAF",
      publie: true,
      modifieLe: DATE,
      modifiePar: "chef",
      journal: j.id,
    });
    lot.set(j, { acteur: "chef", action: "module.cree", cible: id, details: { prix }, date: DATE, horodatage: serverTimestamp() });
    return lot.commit();
  };
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), "utilisateurs/awa"), profil("awa@x.cm"));
      await setDoc(doc(c.firestore(), "progressions/awa"), { etat: { chapitres: {} }, majLe: DATE });
    });
  });

  it("un administrateur accorde un accès avec sa trace, et l'apprenant lit alors le module", async () => {
    await assertFails(getDoc(doc(membre("awa"), "contenus/pa-01")));
    await assertSucceeds(accorder(membre("chef"), "awa", "price-action"));
    await assertSucceeds(getDoc(doc(membre("awa"), "droits/awa_price-action")));
    await assertSucceeds(getDoc(doc(membre("awa"), "contenus/pa-01")));
    const traces = await getDocs(query(collection(membre("chef"), "journalAudit"), where("cible", "==", "awa_price-action")));
    if (traces.size !== 1 || traces.docs[0].get("acteur") !== "chef") throw new Error("Trace absente ou mal attribuée");
  });
  it("pas d'accès sans trace, avec la trace d'un autre, une trace réutilisée ou une heure falsifiée", async () => {
    await assertFails(accorder(membre("chef"), "awa", "price-action", { sansJournal: true }));
    await assertFails(accorder(membre("chef"), "awa", "price-action", { acteur: "autre" }));
    await assertFails(accorder(membre("chef"), "awa", "price-action", { journal: "a1", sansJournal: true }));
    await assertFails(accorder(membre("chef"), "awa", "price-action", { horodatage: "2020-01-01T00:00:00.000Z" }));
    await assertFails(accorder(membre("chef"), "awa", "price-action", { motif: "ok" }));
  });
  it("ni un apprenant, ni un compte inexistant, ni une trace orpheline", async () => {
    await assertFails(accorder(membre("awa"), "awa", "price-action"));
    await assertFails(accorder(membre("chef"), "fantome", "price-action"));
    await assertFails(
      setDoc(doc(membre("chef"), "journalAudit/j1"), {
        acteur: "chef",
        action: "droit.accorde",
        cible: "awa_price-action",
        date: DATE,
        horodatage: serverTimestamp(),
      }),
    );
  });
  it("une révocation garde le droit en base, désactivé, et ne touche à rien d'autre", async () => {
    await assertSucceeds(revoquer(membre("chef"), "payeur_price-action"));
    await assertFails(getDoc(doc(membre("payeur"), "contenus/pa-01")));
    await assertFails(revoquer(membre("chef"), "suspendu_price-action", { uid: "autre" }));
    await assertFails(revoquer(membre("payeur"), "suspendu_price-action"));
  });
  it("un administrateur crée un module avec un prix valide et sa trace ; personne d'autre", async () => {
    await assertSucceeds(creerModule(membre("chef"), "smart-money-concepts", 60000));
    await assertFails(creerModule(membre("chef"), "liquidite-ict", 50));
    await assertFails(creerModule(membre("payeur"), "liquidite-ict", 70000));
    await assertFails(deleteDoc(doc(membre("chef"), "modules/price-action")));
  });
  it("un administrateur lit les profils, la progression et tous les contenus ; un apprenant non", async () => {
    await assertSucceeds(getDocs(collection(membre("chef"), "utilisateurs")));
    await assertSucceeds(getDoc(doc(membre("chef"), "progressions/awa")));
    await assertSucceeds(getDoc(doc(membre("chef"), "contenus/pa-01")));
    await assertSucceeds(getDoc(doc(membre("chef"), "admins/chef")));
    await assertFails(getDocs(collection(membre("awa"), "utilisateurs")));
    await assertFails(getDoc(doc(membre("awa"), "progressions/payeur")));
    await assertFails(getDoc(doc(membre("awa"), "admins/chef")));
  });
  it("personne ne se nomme administrateur depuis le navigateur", async () => {
    await assertFails(setDoc(doc(membre("awa"), "admins/awa"), { email: "awa@x.cm" }));
    await assertFails(setDoc(doc(membre("chef"), "admins/awa"), { email: "awa@x.cm" }));
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

describe("outils et licences", () => {
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      const db = c.firestore();
      await setDoc(doc(db, "catalogueOutils/ea"), { nom: "Expert Advisor Méridien", statut: "sur-demande", prix: null, ordre: 2, publie: true });
      await setDoc(doc(db, "demandesOutils/payeur_ea"), {
        uid: "payeur",
        outil: "ea",
        statut: "en_attente",
        details: { comptes: [{ numero: "51234567", serveur: "MetaQuotes-Demo" }] },
      });
      await setDoc(doc(db, "licences/l1"), { uid: "payeur", outil: "ea", cle: "MER-AAAA-BBBB-CCCC-DDDD", statut: "active", comptes: [], maxComptes: 1 });
    });
  });
  it("les fiches d'outils sont publiques, en lecture seule", async () => {
    await assertSucceeds(getDoc(doc(anonyme(), "catalogueOutils/ea")));
    await assertSucceeds(getDocs(collection(anonyme(), "catalogueOutils")));
    await assertFails(setDoc(doc(membre("chef"), "catalogueOutils/ea"), { prix: 0 }));
  });
  it("une licence n'est lue que par son titulaire ou l'administration, et jamais écrite depuis le navigateur", async () => {
    await assertSucceeds(getDoc(doc(membre("payeur"), "licences/l1")));
    await assertSucceeds(getDocs(query(collection(membre("payeur"), "licences"), where("uid", "==", "payeur"))));
    await assertSucceeds(getDoc(doc(membre("chef"), "licences/l1")));
    await assertFails(getDoc(doc(membre("curieux"), "licences/l1")));
    await assertFails(getDocs(collection(membre("curieux"), "licences")));
    await assertFails(updateDoc(doc(membre("payeur"), "licences/l1"), { maxComptes: 10 }));
    await assertFails(setDoc(doc(membre("payeur"), "licences/l2"), { uid: "payeur", statut: "active" }));
  });
  it("une demande d'outil est lue par son auteur et l'administration, écrite par le serveur seulement", async () => {
    await assertSucceeds(getDoc(doc(membre("payeur"), "demandesOutils/payeur_ea")));
    await assertSucceeds(getDoc(doc(membre("chef"), "demandesOutils/payeur_ea")));
    await assertFails(getDoc(doc(membre("curieux"), "demandesOutils/payeur_ea")));
    await assertFails(updateDoc(doc(membre("payeur"), "demandesOutils/payeur_ea"), { statut: "accordee" }));
  });
});
