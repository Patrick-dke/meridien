import { HttpsError, onCall } from "firebase-functions/v2/https";
import { auditer, db, maintenant, REGION, utilisateurActif } from "./commun";

/** Conditions par défaut ; l'administration les remplace dans `parametres/outils`. */
export const CONDITIONS_PAR_DEFAUT = {
  /** Vide : tous les modules payants publiés sont exigés. */
  modulesRequis: [] as string[],
  scoreMin: 0.8,
  outils: {
    indicateur: { actif: true, nom: "Indicateur Méridien pour MetaTrader 5" },
    ea: { actif: true, nom: "Expert Advisor Méridien pour MetaTrader 5" },
  } as Record<string, { actif: boolean; nom: string }>,
};

export async function conditionsOutils() {
  const doc = await db.doc("parametres/outils").get();
  return { ...CONDITIONS_PAR_DEFAUT, ...(doc.data() ?? {}) } as typeof CONDITIONS_PAR_DEFAUT;
}

/**
 * Éligibilité calculée côté serveur : compte, modules requis achetés, et chaque quiz de ces modules réussi
 * avec au moins le score demandé. Le détail sert à afficher « ce qu'il te reste » à l'apprenant.
 */
export async function eligibilite(uid: string) {
  const cond = await conditionsOutils();
  let requis = cond.modulesRequis;
  if (!requis.length) {
    const payants = await db.collection("modules").where("publie", "==", true).where("gratuit", "==", false).get();
    requis = payants.docs.map((d) => d.id);
  }
  const modules = await Promise.all(
    requis.map(async (module) => {
      const [droit, quiz] = await Promise.all([db.doc(`droits/${uid}_${module}`).get(), db.collection("corriges").where("module", "==", module).select().get()]);
      const evals = quiz.empty ? [] : await db.getAll(...quiz.docs.map((d) => db.doc(`evaluations/${uid}_${d.id}`)));
      const valides = evals.filter((e) => e.get("reussi") === true && (e.get("meilleurScore") ?? 0) >= cond.scoreMin - 1e-9).length;
      return { module, achete: droit.get("actif") === true, chapitres: quiz.size, valides };
    }),
  );
  const eligible = requis.length > 0 && modules.every((m) => m.achete && m.chapitres > 0 && m.valides === m.chapitres);
  return { eligible, scoreMin: cond.scoreMin, modules, outils: cond.outils };
}

export const outils = onCall({ region: REGION }, async (req) => {
  const uid = await utilisateurActif(req);
  const action = req.data?.action;
  const e = await eligibilite(uid);
  const demandes = await db.collection("demandesOutils").where("uid", "==", uid).get();
  const etatDemandes = demandes.docs.map((d) => ({ id: d.id, outil: d.get("outil"), statut: d.get("statut"), creeLe: d.get("creeLe"), note: d.get("noteAdmin") ?? null }));
  if (action === "eligibilite") return { ...e, demandes: etatDemandes };
  if (action !== "demander") throw new HttpsError("invalid-argument", "Action inconnue.");

  const outil = String(req.data?.outil ?? "");
  if (!e.outils[outil]?.actif) throw new HttpsError("invalid-argument", "Cet outil n'est pas proposé.");
  if (!e.eligible) throw new HttpsError("failed-precondition", "Termine d'abord le parcours requis et réussis ses évaluations.");
  const ref = db.doc(`demandesOutils/${uid}_${outil}`);
  const existante = await ref.get();
  if (existante.exists && existante.get("statut") !== "refusee") return { ...e, demandes: etatDemandes, dejaDemande: true };
  const plateforme = String(req.data?.plateforme ?? "MetaTrader 5").slice(0, 60);
  await ref.set({ uid, outil, plateforme, statut: "en_attente", creeLe: maintenant(), conditions: { scoreMin: e.scoreMin, modules: e.modules } });
  await auditer({ acteur: uid, action: "outil.demande", cible: ref.id, details: { outil } });
  return { ...e, demandes: [...etatDemandes.filter((d) => d.id !== ref.id), { id: ref.id, outil, statut: "en_attente", creeLe: maintenant(), note: null }] };
});
