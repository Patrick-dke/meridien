import { createRequire } from "node:module";
import { join } from "node:path";
import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, doc, getDoc, getFirestore, type Firestore } from "firebase/firestore/lite";
import { connectFunctionsEmulator, getFunctions, httpsCallable, type Functions } from "firebase/functions";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COMPTES_TEST } from "../../scripts/emulateurs/comptes";

/**
 * Examens de fin de module dans l'environnement de TEST (émulateurs) : accès réservé au module débloqué,
 * copie sans corrigé, notation serveur, résultat par niveau, variante à la reprise, seuil réglé par l'administration.
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
const email = `examen-${Date.now()}@meridien.test`;
let uid = "";

type Q = { id: string; chapitre: string; type: string; niveau: string; bonne?: number; bonnes?: number[]; reponse?: boolean; explication: string; paires?: string[][]; etapes?: string[] };
type Original = { id: string; type: string; bonne?: number; bonnes?: number[]; reponse?: boolean; paires?: string[][]; etapes?: string[] };

/** Corrigé complet, lu côté serveur (administration du SDK) : sert à fabriquer une copie juste. */
async function corriges() {
  const docs = await dbAdmin.collection("corriges").where("module", "==", MODULE).get();
  return new Map(docs.docs.flatMap((d) => (JSON.parse(d.get("quizJson")) as Original[]).map((q) => [`${d.id}/${q.id}`, q] as const)));
}

/** Réponse juste, exprimée dans les positions affichées par le navigateur (paires et étapes permutées). */
function juste(vue: Q, o: Original) {
  switch (o.type) {
    case "unique":
    case "comparaison":
      return { type: o.type, choix: o.bonne };
    case "multiple":
    case "graphique":
      return { type: o.type, choix: o.bonnes };
    case "vraifaux":
      return { type: "vraifaux", valeur: o.reponse };
    case "association":
      return { type: "association", choix: o.paires!.map(([, droite]) => vue.paires!.findIndex(([, d]) => d === droite)) };
    default:
      return { type: "ordre", ordre: o.etapes!.map((e) => vue.etapes!.indexOf(e)) };
  }
}

async function commeAdmin<T>(f: () => Promise<T>) {
  await signOut(auth);
  await signInWithEmailAndPassword(auth, COMPTES_TEST.admin.email, COMPTES_TEST.admin.motDePasse);
  try {
    return await f();
  } finally {
    await signOut(auth);
    await signInWithEmailAndPassword(auth, email, "MotDePasse-examen-1");
  }
}

beforeAll(async () => {
  app = initializeApp({ apiKey: "demo-cle", projectId: PROJET, appId: "test-examens" }, `examens-${Date.now()}`);
  auth = getAuth(app);
  connectAuthEmulator(auth, `http://${HOTE}:9099`, { disableWarnings: true });
  db = getFirestore(app);
  connectFirestoreEmulator(db, HOTE, 8080);
  fn = getFunctions(app, "europe-west1");
  connectFunctionsEmulator(fn, HOTE, 5001);
  uid = (await createUserWithEmailAndPassword(auth, email, "MotDePasse-examen-1")).user.uid;
});
afterAll(() => deleteApp(app));

describe("examens de fin de module", () => {
  let premiere: Q[] = [];

  it("refusé tant que le module n'est pas débloqué", async () => {
    expect(await code(appeler("examen", { action: "etat", module: MODULE }))).toBe("functions/permission-denied");
    expect(await code(appeler("examen", { action: "commencer", module: "module-inexistant" }))).toBe("functions/not-found");
    // Accès accordé directement par le serveur (le paiement est éprouvé dans parcours.test.ts).
    await dbAdmin.doc(`droits/${uid}_${MODULE}`).set({ uid, module: MODULE, actif: true, source: "test" });
  });

  it("la copie arrive sans corrigé, en trois niveaux, et le tirage reste invisible au navigateur", async () => {
    const etat = await appeler<{ config: { questions: number; seuil: number }; resultat: unknown }>("examen", { action: "etat", module: MODULE });
    expect(etat.config).toMatchObject({ questions: 16, seuil: 0.7 });
    expect(etat.resultat).toBeNull();

    const c = await appeler<{ questions: Q[] }>("examen", { action: "commencer", module: MODULE });
    premiere = c.questions;
    expect(premiere).toHaveLength(16);
    expect(premiere.map((q) => q.niveau)).toEqual([...Array(6).fill("connaissance"), ...Array(6).fill("application"), ...Array(4).fill("transfert")]);
    for (const q of premiere) {
      expect(q.explication).toBe("");
      if ("bonne" in q) expect(q.bonne).toBe(-1);
      if ("bonnes" in q) expect(q.bonnes).toEqual([]);
    }
    expect(new Set(premiere.map((q) => q.chapitre)).size).toBeGreaterThan(3);
    expect(await code(getDoc(doc(db, "examensEnCours", `${uid}_${MODULE}`)))).toBe("permission-denied");
  });

  it("une copie juste vaut 100 %, avec la correction détaillée", async () => {
    const m = await corriges();
    const reponses = premiere.map((q) => juste(q, m.get(`${q.chapitre}/${q.id}`)!));
    const r = await appeler<{ score: number; reussi: boolean; parNiveau: { questions: number }[]; correction: { explication: string }[]; aRevoir: unknown[] }>("examen", {
      action: "rendre",
      module: MODULE,
      reponses,
    });
    expect(r.score).toBe(1);
    expect(r.reussi).toBe(true);
    expect(r.parNiveau.map((n) => n.questions)).toEqual([6, 6, 4]);
    expect(r.correction).toHaveLength(16);
    expect(r.correction.every((c) => c.explication.length > 0)).toBe(true);
    expect(r.aRevoir).toEqual([]);
    const lu = await getDoc(doc(db, "examens", `${uid}_${MODULE}`));
    expect(lu.data()).toMatchObject({ reussi: true, meilleurScore: 1, tentatives: 1 });
    // Copie déjà rendue : plus rien à corriger.
    expect(await code(appeler("examen", { action: "rendre", module: MODULE, reponses }))).toBe("functions/failed-precondition");
  });

  it("une reprise donne une autre variante ; un échec ne retire pas la validation", async () => {
    const c = await appeler<{ questions: Q[] }>("examen", { action: "commencer", module: MODULE });
    const avant = new Set(premiere.map((q) => `${q.chapitre}/${q.id}`));
    const communes = c.questions.filter((q) => avant.has(`${q.chapitre}/${q.id}`));
    expect(communes.length).toBeLessThan(8);
    const r = await appeler<{ score: number; reussi: boolean; reussiModule: boolean; aRevoir: unknown[] }>("examen", {
      action: "rendre",
      module: MODULE,
      reponses: c.questions.map(() => ({ type: "unique", choix: 99 })),
    });
    expect(r.score).toBe(0);
    expect(r.reussi).toBe(false);
    expect(r.reussiModule).toBe(true);
    expect(r.aRevoir.length).toBeGreaterThan(0);
  });

  it("l'administration règle le seuil et le nombre de questions par niveau", async () => {
    await commeAdmin(async () => {
      expect(await code(appeler("admin", { action: "parametres.modifier", section: "examens", valeurs: { connaissance: 1, application: 1, transfert: 1 } }))).toBe(
        "functions/invalid-argument",
      );
      await appeler("admin", { action: "parametres.modifier", section: "examens", valeurs: { seuil: 0.9, connaissance: 3, application: 3, transfert: 2 }, motif: "Essai" });
      const liste = await appeler<{ uid: string; reussi: boolean; tentatives: number }[]>("admin", { action: "examens.lister", module: MODULE });
      expect(liste.find((l) => l.uid === uid)).toMatchObject({ reussi: true, tentatives: 2 });
    });
    expect(await code(appeler("admin", { action: "examens.lister" }))).toBe("functions/permission-denied");
    const c = await appeler<{ questions: Q[]; config: { seuil: number } }>("examen", { action: "commencer", module: MODULE });
    expect(c.questions).toHaveLength(8);
    expect(c.config.seuil).toBe(0.9);
    await commeAdmin(() => appeler("admin", { action: "parametres.modifier", section: "examens", valeurs: {}, motif: "Retour aux valeurs de départ" }));
  });
});
