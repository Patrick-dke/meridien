import { randomInt } from "node:crypto";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { db, limiter, maintenant, REGION, utilisateurActif } from "../commun";
import { aAcces } from "../quiz";
import {
  alea,
  cleQuestion,
  corriger,
  lireConfig,
  NIVEAUX,
  tirerExamen,
  versionSansCorrige,
  type Candidate,
  type ConfigExamen,
  type QuestionBanque,
  type Tiree,
} from "./regles";

/** Une tentative reste ouverte trois heures : au-delà, on recommence une nouvelle variante. */
const DUREE_TENTATIVE_MS = 3 * 3600 * 1000;

const idModule = (x: unknown) => (typeof x === "string" && /^[a-z0-9-]{2,60}$/.test(x) ? x : "");

/** Banque d'un module : les quiz de tous ses chapitres, tirés du corrigé serveur (jamais du navigateur). */
async function banqueDuModule(module: string): Promise<Candidate[]> {
  const corriges = await db.collection("corriges").where("module", "==", module).get();
  return corriges.docs.flatMap((d) => (JSON.parse(d.get("quizJson") ?? "[]") as QuestionBanque[]).map((q) => ({ slug: d.id, q })));
}

const scenesDe = (q: QuestionBanque) =>
  [q.scene, q.figure?.scene, ...(q.graphiques ?? []).map((g) => g.scene)].filter((s): s is string => typeof s === "string");

const resumeConfig = (c: ConfigExamen) => ({
  seuil: c.seuil,
  parNiveau: { connaissance: c.connaissance, application: c.application, transfert: c.transfert },
  questions: c.connaissance + c.application + c.transfert,
  attenteMinutes: c.attenteMinutes,
});

/** Titres des chapitres et scènes de graphiques des modules payants (les scènes publiques sont déjà dans le site). */
async function contexte(slugs: string[]) {
  const docs = slugs.length ? await db.getAll(...slugs.map((s) => db.doc(`contenus/${s}`))) : [];
  const titres: Record<string, string> = {};
  const scenes: Record<string, Record<string, unknown>> = {};
  for (const d of docs) {
    if (!d.exists) continue;
    titres[d.id] = String(d.get("titre") ?? d.id);
    scenes[d.id] = JSON.parse(d.get("scenesJson") ?? "{}") as Record<string, unknown>;
  }
  return { titres, scenes };
}

export const examen = onCall({ region: REGION }, async (req) => {
  const uid = await utilisateurActif(req);
  const action = req.data?.action;
  const idMod = idModule(req.data?.module);
  if (!idMod) throw new HttpsError("invalid-argument", "Module inconnu.");
  if (!(await db.doc(`modules/${idMod}`).get()).exists) throw new HttpsError("not-found", "Module inconnu.");
  if (!(await aAcces(uid, idMod))) throw new HttpsError("permission-denied", "Cet examen fait partie d'un module que tu n'as pas encore débloqué.");
  const config = lireConfig((await db.doc("parametres/examens").get()).data());
  const refResultat = db.doc(`examens/${uid}_${idMod}`);
  const refEnCours = db.doc(`examensEnCours/${uid}_${idMod}`);

  if (action === "etat") {
    const [resultat, enCours] = await db.getAll(refResultat, refEnCours);
    const r = resultat.data();
    return {
      config: resumeConfig(config),
      resultat: r ? { meilleurScore: r.meilleurScore, dernierScore: r.dernierScore, reussi: r.reussi, tentatives: r.tentatives, date: r.date } : null,
      prochaineTentative: r && !r.reussi && config.attenteMinutes ? new Date((r.dateMs as number) + config.attenteMinutes * 60_000).toISOString() : null,
      enCours: enCours.exists && (enCours.get("expire") as number) > Date.now(),
    };
  }

  if (action === "commencer") {
    const precedent = await refResultat.get();
    if (config.attenteMinutes && precedent.exists && !precedent.get("reussi")) {
      const prochaine = (precedent.get("dateMs") as number) + config.attenteMinutes * 60_000;
      if (Date.now() < prochaine) {
        const heure = new Date(prochaine).toLocaleString("fr-FR", { timeZone: "Africa/Douala", dateStyle: "short", timeStyle: "short" });
        throw new HttpsError("failed-precondition", `Prends le temps de revoir les chapitres conseillés : prochaine tentative possible le ${heure}.`);
      }
    }
    await limiter(`examen:${uid}:${idMod}`, 6, 86400, "Tu as commencé beaucoup d'examens aujourd'hui. Revois les chapitres conseillés et reviens demain.");
    const banque = await banqueDuModule(idMod);
    if (!banque.length) throw new HttpsError("failed-precondition", "L'examen de ce module n'est pas encore disponible.");
    const vues = new Set<string>((precedent.get("dernieresQuestions") as string[] | undefined) ?? []);
    const tirees = tirerExamen(banque, config, vues, alea(randomInt(2 ** 32)));
    const parCle = new Map(banque.map((c) => [cleQuestion(c.slug, c.q.id), c.q]));
    const { titres, scenes: toutes } = await contexte([...new Set(tirees.map((t) => t.slug))]);
    const scenes: Record<string, unknown> = {};
    for (const t of tirees) for (const s of scenesDe(parCle.get(cleQuestion(t.slug, t.id))!)) if (toutes[t.slug]?.[s]) scenes[s] = toutes[t.slug][s];
    const expire = Date.now() + DUREE_TENTATIVE_MS;
    await refEnCours.set({ uid, module: idMod, tirees, debut: maintenant(), expire });
    return {
      config: resumeConfig(config),
      expire: new Date(expire).toISOString(),
      questions: tirees.map((t) => ({ ...versionSansCorrige(parCle.get(cleQuestion(t.slug, t.id))!, t), chapitre: t.slug })),
      scenes,
      titres,
    };
  }

  if (action === "rendre") {
    const enCours = await refEnCours.get();
    if (!enCours.exists) throw new HttpsError("failed-precondition", "Aucun examen en cours : commence une nouvelle tentative.");
    if ((enCours.get("expire") as number) < Date.now()) {
      await refEnCours.delete();
      throw new HttpsError("failed-precondition", "Le temps de cette tentative est écoulé (3 heures). Commence une nouvelle variante.");
    }
    const tirees = enCours.get("tirees") as Tiree[];
    const reponses = Array.isArray(req.data?.reponses) ? (req.data.reponses as unknown[]) : null;
    if (!reponses || reponses.length !== tirees.length) throw new HttpsError("invalid-argument", "Copie incomplète : envoie une réponse par question.");
    const banque = await banqueDuModule(idMod);
    const parCle = new Map(banque.map((c) => [cleQuestion(c.slug, c.q.id), c.q]));
    if (tirees.some((t) => !parCle.has(cleQuestion(t.slug, t.id)))) {
      await refEnCours.delete();
      throw new HttpsError("failed-precondition", "Le module a été mis à jour pendant ta tentative. Commence une nouvelle variante.");
    }
    const r = corriger(tirees, parCle, reponses, config.seuil);
    const date = maintenant();
    const bilan = await db.runTransaction(async (t) => {
      const avant = await t.get(refResultat);
      const meilleurScore = Math.max(r.score, (avant.get("meilleurScore") as number | undefined) ?? 0);
      const tentatives = ((avant.get("tentatives") as number | undefined) ?? 0) + 1;
      const reussi = avant.get("reussi") === true || r.reussi;
      t.set(refResultat, {
        uid,
        module: idMod,
        dernierScore: r.score,
        meilleurScore,
        reussi,
        seuil: config.seuil,
        tentatives,
        parNiveau: r.parNiveau,
        parConcept: r.parConcept,
        aRevoir: r.aRevoir,
        dernieresQuestions: tirees.map((x) => cleQuestion(x.slug, x.id)),
        premiereReussite: avant.get("premiereReussite") ?? (r.reussi ? date : null),
        date,
        dateMs: Date.now(),
      });
      t.delete(refEnCours);
      return { meilleurScore, tentatives, reussiModule: reussi };
    });
    const { titres } = await contexte([...new Set(tirees.map((x) => x.slug))]);
    return { ...r, ...bilan, seuil: config.seuil, niveaux: NIVEAUX, titres };
  }

  throw new HttpsError("invalid-argument", "Action inconnue.");
});
