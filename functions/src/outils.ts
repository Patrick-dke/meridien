import { HttpsError, onCall } from "firebase-functions/v2/https";
import { outilDuCatalogue, ouvertAuxDemandes } from "./catalogue";
import { auditer, db, limiter, maintenant, REGION, utilisateurActif } from "./commun";
import { normaliserNumeroCompte, normaliserServeur } from "./licences/regles";

/** Conditions par défaut ; l'administration les remplace dans `parametres/outils`. */
export const CONDITIONS_PAR_DEFAUT = {
  /** Vide : tous les modules payants publiés sont exigés. */
  modulesRequis: [] as string[],
  scoreMin: 0.8,
  outils: {
    indicateur: { actif: true, nom: "Indicateur Méridien pour TradingView" },
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

/** Champs qui ne doivent jamais transiter par une demande : Méridien n'a besoin d'aucun mot de passe. */
const CHAMPS_INTERDITS = /mot.?de.?passe|password|passwd|^mdp$|^pass$|^pin$|investor|secret/i;
function contientChampInterdit(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  return Object.entries(v as Record<string, unknown>).some(([k, x]) => CHAMPS_INTERDITS.test(k) || contientChampInterdit(x));
}

/** Identifiant public TradingView (celui de l'URL du profil), seule donnée nécessaire pour ouvrir un script privé. */
export const normaliserIdentifiantTradingView = (v: unknown) => (typeof v === "string" && /^[A-Za-z0-9_.-]{2,40}$/.test(v.trim()) ? v.trim() : null);

/** Détails propres à la plateforme : identifiant TradingView, ou comptes MetaTrader 5 et mode d'installation. */
function detailsDemande(plateforme: string, d: Record<string, unknown>) {
  if (plateforme === "TradingView") {
    const identifiantTradingView = normaliserIdentifiantTradingView(d.identifiantTradingView);
    if (!identifiantTradingView) throw new HttpsError("invalid-argument", "Indique ton identifiant TradingView (celui qui apparaît dans l'adresse de ton profil).");
    return { identifiantTradingView };
  }
  const brut = Array.isArray(d.comptes) ? d.comptes : [];
  const comptes = brut.slice(0, 3).map((c) => {
    const x = (c ?? {}) as Record<string, unknown>;
    const numero = normaliserNumeroCompte(x.numero);
    const serveur = normaliserServeur(x.serveur);
    if (!numero || !serveur) throw new HttpsError("invalid-argument", "Chaque compte : son numéro (chiffres seulement) et le nom exact du serveur de ton courtier.");
    return { numero, serveur };
  });
  if (!comptes.length) throw new HttpsError("invalid-argument", "Indique au moins un numéro de compte MetaTrader 5 à autoriser.");
  const installation = d.installation === "assistee" ? "assistee" : d.installation === "autonome" ? "autonome" : null;
  if (!installation) throw new HttpsError("invalid-argument", "Choisis un mode d'installation : autonome ou accompagnée.");
  if (installation === "assistee" && d.consentementAssistance !== true)
    throw new HttpsError("invalid-argument", "L'installation accompagnée demande ton accord explicite pour une session ponctuelle, que tu ouvres et fermes toi-même.");
  return { comptes, installation, consentementAssistance: installation === "assistee" };
}

export const outils = onCall({ region: REGION }, async (req) => {
  const uid = await utilisateurActif(req);
  const action = req.data?.action;
  const e = await eligibilite(uid);
  const demandes = await db.collection("demandesOutils").where("uid", "==", uid).get();
  const etatDemandes = demandes.docs.map((d) => ({ id: d.id, outil: d.get("outil"), mode: d.get("mode") ?? null, statut: d.get("statut"), creeLe: d.get("creeLe"), note: d.get("noteAdmin") ?? null }));
  if (action === "eligibilite") return { ...e, demandes: etatDemandes };
  if (action !== "demander") throw new HttpsError("invalid-argument", "Action inconnue.");
  if (contientChampInterdit(req.data)) throw new HttpsError("invalid-argument", "Ne communique jamais de mot de passe : Méridien n'en a besoin à aucun moment.");
  await limiter(`demande-outil:${uid}`, 10, 3600, "Trop de demandes en peu de temps. Réessaie dans une heure.");

  const outil = await outilDuCatalogue(String(req.data?.outil ?? ""));
  if (!outil || !outil.publie) throw new HttpsError("invalid-argument", "Cet outil n'est pas proposé.");
  if (!ouvertAuxDemandes(outil)) throw new HttpsError("failed-precondition", "Cet outil n'est pas encore ouvert aux demandes.");
  const mode = String(req.data?.mode ?? "");
  if (!(outil.modesAcces as string[]).includes(mode)) throw new HttpsError("invalid-argument", "Ce mode d'accès n'est pas proposé pour cet outil.");
  if (mode === "etudiants" && !e.eligible) throw new HttpsError("failed-precondition", "Termine d'abord le parcours requis et réussis ses évaluations.");
  if (mode === "parcours") {
    const droits = outil.modulesInclus.length ? await db.getAll(...outil.modulesInclus.map((m) => db.doc(`droits/${uid}_${m}`))) : [];
    if (!droits.some((d) => d.get("actif") === true)) throw new HttpsError("failed-precondition", "Cet outil est inclus avec certains modules : achète l'un d'eux pour le demander.");
  }
  const details = detailsDemande(outil.plateforme, (req.data ?? {}) as Record<string, unknown>);
  const message = typeof req.data?.message === "string" ? req.data.message.trim().slice(0, 500) : "";

  const ref = db.doc(`demandesOutils/${uid}_${outil.id}`);
  const existante = await ref.get();
  if (existante.exists && existante.get("statut") !== "refusee") return { ...e, demandes: etatDemandes, dejaDemande: true };
  const creeLe = maintenant();
  await ref.set({
    uid,
    email: req.auth?.token.email ?? null,
    outil: outil.id,
    nomOutil: outil.nom,
    plateforme: outil.plateforme,
    mode,
    details,
    message: message || null,
    statut: "en_attente",
    creeLe,
    ...(mode === "etudiants" ? { conditions: { scoreMin: e.scoreMin, modules: e.modules } } : {}),
  });
  await auditer({ acteur: uid, action: "outil.demande", cible: ref.id, details: { outil: outil.id, mode } });
  return { ...e, demandes: [...etatDemandes.filter((d) => d.id !== ref.id), { id: ref.id, outil: outil.id, mode, statut: "en_attente", creeLe, note: null }] };
});
