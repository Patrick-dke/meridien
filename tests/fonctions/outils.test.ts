import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, type Auth } from "firebase/auth";
import { collection, connectFirestoreEmulator, getDocs, getFirestore, query, where, type Firestore } from "firebase/firestore/lite";
import { connectFunctionsEmulator, getFunctions, httpsCallable, type Functions } from "firebase/functions";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COMPTES_TEST } from "../../scripts/emulateurs/comptes";

/**
 * Indicateurs et robots dans l'environnement de TEST (émulateurs) : fiche ouverte par l'administration, demande
 * d'accès sans mot de passe, licence créée à l'acceptation, vérification signée par le point d'accès du robot,
 * activation automatique bornée, suspension. Lancement : npm run test:fonctions
 */
const PROJET = "demo-meridien";
const HOTE = "127.0.0.1";
const URL_VERIFICATION = `http://${HOTE}:5001/${PROJET}/europe-west1/verifierLicence`;
// Valeur de test lue dans functions/.secret.local, comme le fait l'émulateur des fonctions.
const SECRET = /^LICENCE_SIGNATURE=(.*)$/m.exec(readFileSync("functions/.secret.local", "utf8"))?.[1]?.trim() ?? "";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let fn: Functions;
const appeler = <R = Record<string, unknown>>(nom: string, d?: unknown) => httpsCallable(fn, nom)(d).then((r) => r.data as R);
const code = (p: Promise<unknown>) => p.then(() => "ok", (e: { code?: string }) => e.code);
const email = `outils-${Date.now()}@meridien.test`;
let uid = "";
let cle = "";

const verifier = async (corps: Record<string, unknown>) => {
  const r = await fetch(URL_VERIFICATION, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });
  return { statut: r.status, json: (await r.json()) as Record<string, string | boolean | null> };
};
const signatureAttendue = (j: Record<string, string | boolean | null>) =>
  createHmac("sha256", SECRET)
    .update([j.valide ? "1" : "0", j.raison, j.cle, j.compte, j.nonce, j.horodatage, j.expireLe ?? ""].join("|"))
    .digest("hex");

const fiche = (id: "ea" | "indicateur") => ({
  id,
  nom: id === "ea" ? "Expert Advisor Méridien" : "Indicateur Méridien",
  categorie: id === "ea" ? "robot" : "indicateur",
  plateforme: id === "ea" ? "MetaTrader 5" : "TradingView",
  resume: "Fiche d'essai pour l'environnement de test.",
  fonctionnalites: ["Essai"],
  conditionsUtilisation: ["Essai"],
  statut: "sur-demande",
  modesAcces: ["achat", "etudiants"],
  prix: null,
  modulesInclus: [],
  ordre: id === "ea" ? 2 : 1,
  publie: true,
});

async function commeAdmin<T>(f: () => Promise<T>) {
  await signOut(auth);
  await signInWithEmailAndPassword(auth, COMPTES_TEST.admin.email, COMPTES_TEST.admin.motDePasse);
  try {
    return await f();
  } finally {
    await signOut(auth);
    await signInWithEmailAndPassword(auth, email, "MotDePasse-outils-1");
  }
}

beforeAll(async () => {
  app = initializeApp({ apiKey: "demo-cle", projectId: PROJET, appId: "test-outils" }, `outils-${Date.now()}`);
  auth = getAuth(app);
  connectAuthEmulator(auth, `http://${HOTE}:9099`, { disableWarnings: true });
  db = getFirestore(app);
  connectFirestoreEmulator(db, HOTE, 8080);
  fn = getFunctions(app, "europe-west1");
  connectFunctionsEmulator(fn, HOTE, 5001);
  uid = (await createUserWithEmailAndPassword(auth, email, "MotDePasse-outils-1")).user.uid;
});
afterAll(() => deleteApp(app));

describe("indicateurs et robots", () => {
  it("un outil en préparation refuse les demandes", async () => {
    expect(SECRET.length).toBeGreaterThan(10);
    expect(await code(appeler("outils", { action: "demander", outil: "ea", mode: "achat" }))).toBe("functions/failed-precondition");
  });

  it("l'administration ouvre les fiches, avec motif journalisé ; une fiche invalide est refusée", async () => {
    await commeAdmin(async () => {
      expect(await code(appeler("admin", { action: "catalogue.enregistrer", outil: { ...fiche("ea"), prix: -5 }, motif: "Essai invalide" }))).toBe("functions/invalid-argument");
      await appeler("admin", { action: "catalogue.enregistrer", outil: fiche("ea"), motif: "Ouverture en test" });
      await appeler("admin", { action: "catalogue.enregistrer", outil: fiche("indicateur"), motif: "Ouverture en test" });
    });
  });

  it("une demande ne transporte jamais de mot de passe et exige des comptes valides", async () => {
    const base = { action: "demander", outil: "ea", mode: "achat", installation: "autonome" };
    expect(await code(appeler("outils", { ...base, comptes: [{ numero: "51234567", serveur: "MetaQuotes-Demo", motDePasse: "x" }] }))).toBe("functions/invalid-argument");
    expect(await code(appeler("outils", { ...base, comptes: [{ numero: "abc", serveur: "MetaQuotes-Demo" }] }))).toBe("functions/invalid-argument");
    expect(await code(appeler("outils", { ...base, mode: "etudiants", comptes: [{ numero: "51234567", serveur: "MetaQuotes-Demo" }] }))).toBe("functions/failed-precondition");
    expect(await code(appeler("outils", { ...base, installation: "assistee", comptes: [{ numero: "51234567", serveur: "MetaQuotes-Demo" }] }))).toBe("functions/invalid-argument");
  });

  it("demande de robot, puis licence créée à l'acceptation et visible par son seul titulaire", async () => {
    const r = await appeler<{ demandes: { outil: string; statut: string }[] }>("outils", {
      action: "demander",
      outil: "ea",
      mode: "achat",
      installation: "autonome",
      comptes: [{ numero: "51234567", serveur: "MetaQuotes-Demo" }],
    });
    expect(r.demandes.find((d) => d.outil === "ea")?.statut).toBe("en_attente");
    const bis = await appeler<{ dejaDemande?: boolean }>("outils", { action: "demander", outil: "ea", mode: "achat", installation: "autonome", comptes: [{ numero: "51234567", serveur: "MetaQuotes-Demo" }] });
    expect(bis.dejaDemande).toBe(true);

    const accord = await commeAdmin(() => appeler<{ licence: string }>("admin", { action: "demandes.traiter", id: `${uid}_ea`, decision: "accordee", note: "Bienvenue", maxComptes: 2 }));
    expect(accord.licence).toBeTruthy();
    const mes = await getDocs(query(collection(db, "licences"), where("uid", "==", uid)));
    expect(mes.size).toBe(1);
    const l = mes.docs[0].data();
    expect(l.statut).toBe("active");
    expect(l.maxComptes).toBe(2);
    expect(l.activationAuto).toBe(true);
    expect(l.comptes).toHaveLength(1);
    expect(JSON.stringify(l)).not.toMatch(/mot.?de.?passe|password/i);
    cle = l.cle;
    expect(cle).toMatch(/^MER(-[A-HJ-NP-Z2-9]{4}){4}$/);
  });

  it("le robot reçoit une réponse signée : compte autorisé, activation bornée, refus sinon", async () => {
    const ok = await verifier({ cle, compte: "51234567", serveur: "MetaQuotes-Demo", version: "1.0", nonce: "nonce00000001" });
    expect(ok.statut).toBe(200);
    expect(ok.json).toMatchObject({ valide: true, raison: "ok", nonce: "nonce00000001", compte: "51234567" });
    expect(ok.json.signature).toBe(signatureAttendue(ok.json));

    const ajout = await verifier({ cle, compte: "77777777", serveur: "Exness-MT5Trial", version: "1.0", nonce: "nonce00000002" });
    expect(ajout.json).toMatchObject({ valide: true, raison: "ok" });
    const plein = await verifier({ cle, compte: "88888888", serveur: "Exness-MT5Trial", version: "1.0", nonce: "nonce00000003" });
    expect(plein.json).toMatchObject({ valide: false, raison: "compte-non-autorise" });
    expect(plein.json.signature).toBe(signatureAttendue(plein.json));

    expect((await verifier({ cle: "MER-AAAA-BBBB-CCCC-DDDD", compte: "51234567", serveur: "MetaQuotes-Demo", nonce: "nonce00000004" })).json.raison).toBe("inconnue");
    expect((await verifier({ cle, compte: "51234567", serveur: "MetaQuotes-Demo", nonce: "court" })).json.raison).toBe("requete-invalide");
    expect((await fetch(URL_VERIFICATION)).status).toBe(405);
  });

  it("une licence suspendue arrête le robot ; l'apprenant ne peut pas la modifier", async () => {
    const id = (await getDocs(query(collection(db, "licences"), where("uid", "==", uid)))).docs[0].id;
    await commeAdmin(async () => {
      expect(await code(appeler("admin", { action: "licences.modifier", id, statut: "suspendue" }))).toBe("functions/invalid-argument");
      await appeler("admin", { action: "licences.modifier", id, statut: "suspendue", motif: "Essai de suspension" });
    });
    expect((await verifier({ cle, compte: "51234567", serveur: "MetaQuotes-Demo", nonce: "nonce00000005" })).json).toMatchObject({ valide: false, raison: "suspendue" });
    expect(await code(appeler("admin", { action: "licences.modifier", id, statut: "active", motif: "Tentative apprenant" }))).toBe("functions/permission-denied");
  });

  it("indicateur TradingView : identifiant exigé, accès noté à l'acceptation", async () => {
    expect(await code(appeler("outils", { action: "demander", outil: "indicateur", mode: "achat" }))).toBe("functions/invalid-argument");
    await appeler("outils", { action: "demander", outil: "indicateur", mode: "achat", identifiantTradingView: "awa_trades" });
    await commeAdmin(() => appeler("admin", { action: "demandes.traiter", id: `${uid}_indicateur`, decision: "accordee", note: "Accès ouvert", expireLe: "2027-12-31" }));
    const r = await appeler<{ demandes: { outil: string; statut: string }[] }>("outils", { action: "eligibilite" });
    expect(r.demandes.find((d) => d.outil === "indicateur")?.statut).toBe("accordee");
  });
});
