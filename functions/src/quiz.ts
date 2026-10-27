import { HttpsError, onCall } from "firebase-functions/v2/https";
import { auditer, db, hacher, limiter, maintenant, REGION, utilisateurActif } from "./commun";

/**
 * Notation officielle des quiz. Le barème est celui du site (src/lib/apprentissage/quiz.ts), mais le corrigé
 * vient de la collection serveur `corriges` : un résultat envoyé par le navigateur n'est jamais cru tel quel.
 */
type Question =
  | { id: string; type: "unique"; bonne: number; concepts: string[] }
  | { id: string; type: "multiple"; bonnes: number[]; concepts: string[] }
  | { id: string; type: "vraifaux"; reponse: boolean; concepts: string[] }
  | { id: string; type: "association"; paires: unknown[]; concepts: string[] }
  | { id: string; type: "ordre"; etapes: unknown[]; concepts: string[] };

type Reponse =
  | { type: "unique"; choix: number | null }
  | { type: "multiple"; choix: number[] }
  | { type: "vraifaux"; valeur: boolean | null }
  | { type: "association"; choix: number[] }
  | { type: "ordre"; ordre: number[] };

export const SEUIL_REUSSITE = 0.8;

const entiers = (x: unknown): x is number[] => Array.isArray(x) && x.length <= 20 && x.every((v) => Number.isInteger(v));

export function noter(q: Question, r: Reponse | undefined): number {
  if (!r || r.type !== q.type) return 0;
  switch (q.type) {
    case "unique":
      return r.type === "unique" && r.choix === q.bonne ? 1 : 0;
    case "vraifaux":
      return r.type === "vraifaux" && r.valeur === q.reponse ? 1 : 0;
    case "multiple": {
      if (r.type !== "multiple" || !entiers(r.choix)) return 0;
      const choix = [...new Set(r.choix)];
      const justes = choix.filter((c) => q.bonnes.includes(c)).length;
      const fausses = choix.filter((c) => !q.bonnes.includes(c)).length;
      return Math.max(0, (justes - fausses) / q.bonnes.length);
    }
    case "association":
      if (r.type !== "association" || !entiers(r.choix) || r.choix.length !== q.paires.length) return 0;
      return r.choix.filter((c, i) => c === i).length / q.paires.length;
    case "ordre":
      if (r.type !== "ordre" || !entiers(r.ordre) || r.ordre.length !== q.etapes.length || new Set(r.ordre).size !== r.ordre.length) return 0;
      return r.ordre.filter((origine, position) => origine === position).length / q.etapes.length;
  }
}

export function noterQuizServeur(questions: Question[], reponses: Reponse[]) {
  const notes = questions.map((q, i) => noter(q, reponses[i]));
  const score = notes.reduce((a, b) => a + b, 0) / questions.length;
  const parConcept = new Map<string, number[]>();
  questions.forEach((q, i) => {
    for (const c of q.concepts) parConcept.set(c, [...(parConcept.get(c) ?? []), notes[i]]);
  });
  return {
    notes,
    score,
    reussi: score >= SEUIL_REUSSITE - 1e-9,
    parConcept: [...parConcept].map(([concept, s]) => ({ concept, score: s.reduce((a, b) => a + b, 0) / s.length })),
  };
}

export async function aAcces(uid: string, module: string) {
  const mod = await db.doc(`modules/${module}`).get();
  if (mod.get("gratuit") === true) return true;
  return (await db.doc(`droits/${uid}_${module}`).get()).get("actif") === true;
}

export const noterQuiz = onCall({ region: REGION }, async (req) => {
  const uid = await utilisateurActif(req);
  const slug = typeof req.data?.slug === "string" ? req.data.slug : "";
  const reponses = Array.isArray(req.data?.reponses) ? (req.data.reponses as Reponse[]) : null;
  const corrige = slug ? await db.doc(`corriges/${slug}`).get() : null;
  if (!corrige?.exists || !reponses) throw new HttpsError("not-found", "Quiz introuvable.");
  const idModule = corrige.get("module") as string;
  if (!(await aAcces(uid, idModule))) throw new HttpsError("permission-denied", "Ce quiz fait partie d'un module que tu n'as pas encore débloqué.");
  const questions = JSON.parse(corrige.get("quizJson")) as Question[];
  if (reponses.length !== questions.length) throw new HttpsError("invalid-argument", "Réponds à toutes les questions.");
  await limiter(`quiz:${uid}:${slug}`, 8, 3600, "Tu as fait beaucoup d'essais sur ce quiz. Relis le cours et reviens dans une heure.");

  const r = noterQuizServeur(questions, reponses);
  const date = maintenant();
  const ref = db.doc(`evaluations/${uid}_${slug}`);
  await db.runTransaction(async (t) => {
    const avant = await t.get(ref);
    const meilleur = Math.max(r.score, avant.get("meilleurScore") ?? 0);
    t.set(ref, {
      uid,
      slug,
      module: idModule,
      dernierScore: r.score,
      meilleurScore: meilleur,
      reussi: meilleur >= SEUIL_REUSSITE - 1e-9,
      tentatives: (avant.get("tentatives") ?? 0) + 1,
      parConcept: r.parConcept,
      premiereReussite: avant.get("premiereReussite") ?? (r.reussi ? date : null),
      date,
    });
  });
  const cert = r.reussi ? await delivrerCertificatSiComplet(uid, idModule) : null;
  return { ...r, certificat: cert };
});

/** Un module est validé quand chacun de ses quiz est réussi ; un certificat interne est alors délivré, une seule fois. */
export const numeroCertificat = (uid: string, module: string) => `MER-${hacher(`${uid}:${module}`).slice(0, 10).toUpperCase()}`;

export async function delivrerCertificatSiComplet(uid: string, module: string) {
  // Identifiant = numéro du certificat : n'importe qui peut le vérifier, sans pouvoir lister les autres.
  const numero = numeroCertificat(uid, module);
  const ref = db.doc(`certificats/${numero}`);
  if ((await ref.get()).exists) return numero;
  const quiz = await db.collection("corriges").where("module", "==", module).select().get();
  if (quiz.empty) return null;
  const evaluations = await db.getAll(...quiz.docs.map((d) => db.doc(`evaluations/${uid}_${d.id}`)));
  if (!evaluations.every((e) => e.get("reussi") === true)) return null;
  const moyenne = evaluations.reduce((s, e) => s + (e.get("meilleurScore") as number), 0) / evaluations.length;
  const [profil, mod] = await Promise.all([db.doc(`utilisateurs/${uid}`).get(), db.doc(`modules/${module}`).get()]);
  await ref.set({ numero, uid, module, titreModule: mod.get("titre") ?? module, nom: profil.get("nom") ?? "", scoreMoyen: moyenne, chapitres: evaluations.length, date: maintenant() });
  await auditer({ acteur: "systeme", action: "certificat.delivre", cible: numero, details: { module, uid } });
  return numero;
}
