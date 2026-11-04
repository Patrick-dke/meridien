import { createHmac, randomInt } from "node:crypto";

/**
 * Règles des licences du robot MetaTrader 5, sans dépendance à Firebase (testées à part).
 *
 * Une licence autorise un logiciel à fonctionner sur des comptes de trading précis. Elle ne donne aucun accès au
 * compte : le robot envoie seulement le numéro de compte et le nom du serveur, deux informations publiques, et
 * jamais de mot de passe. Le serveur répond « autorisé » ou non, avec une signature que le robot vérifie.
 */

export type StatutLicence = "active" | "suspendue" | "revoquee";
export type CompteAutorise = { numero: string; serveur: string; ajouteLe: string };

export type Licence = {
  uid: string;
  outil: string;
  cle: string;
  statut: StatutLicence;
  comptes: CompteAutorise[];
  /** Nombre de comptes que la licence peut couvrir en même temps. */
  maxComptes: number;
  /** Comptes ajoutés au premier lancement du robot (installation autonome), tant qu'il reste de la place. */
  activationAuto: boolean;
  /** Nombre total de comptes activés depuis la création, y compris ceux retirés ensuite. */
  activations: number;
  expireLe: string | null;
};

export type Raison = "ok" | "inconnue" | "suspendue" | "revoquee" | "expiree" | "compte-non-autorise" | "requete-invalide";

export const MESSAGES: Record<Raison, string> = {
  ok: "Licence valide pour ce compte.",
  inconnue: "Clé de licence inconnue. Vérifie la clé saisie dans les paramètres du robot.",
  suspendue: "Licence suspendue. Contacte Méridien depuis ton espace.",
  revoquee: "Licence révoquée.",
  expiree: "Licence expirée.",
  "compte-non-autorise": "Ce compte n'est pas autorisé pour cette licence. Ajoute-le depuis ton espace ou demande-le à Méridien.",
  "requete-invalide": "Requête invalide.",
};

// Alphabet sans caractères ambigus (ni I, O, 0, 1) : une clé se recopie sans erreur.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** « MER-7KQ2-…-…-… » : quatre groupes de quatre caractères, 80 bits d'aléa. */
export function genererCle() {
  const groupe = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `MER-${groupe()}-${groupe()}-${groupe()}-${groupe()}`;
}

export function normaliserCle(v: unknown) {
  if (typeof v !== "string") return null;
  const c = v.trim().toUpperCase();
  return /^MER(-[A-HJ-NP-Z2-9]{4}){4}$/.test(c) ? c : null;
}

/** Numéro de compte MetaTrader : un identifiant numérique (le « login »), jamais un mot de passe. */
export function normaliserNumeroCompte(v: unknown) {
  const n = typeof v === "number" ? String(v) : typeof v === "string" ? v.trim() : "";
  return /^\d{3,15}$/.test(n) ? n : null;
}

/** Nom du serveur du courtier (« MetaQuotes-Demo », « Exness-MT5Real8 »…). */
export function normaliserServeur(v: unknown) {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length >= 2 && s.length <= 80 && /^[\p{L}\p{N} ._\-()]+$/u.test(s) ? s : null;
}

const memeCompte = (c: CompteAutorise, numero: string, serveur: string) => c.numero === numero && c.serveur.toLowerCase() === serveur.toLowerCase();

/**
 * Décision pour une vérification : licence connue, active, non expirée, et compte autorisé (ou ajouté s'il reste une
 * place et que l'activation automatique est permise).
 */
export function decider(l: Licence | null, numero: string, serveur: string, maintenant: Date): { raison: Raison; ajouter?: CompteAutorise } {
  if (!l) return { raison: "inconnue" };
  if (l.statut === "revoquee") return { raison: "revoquee" };
  if (l.statut === "suspendue") return { raison: "suspendue" };
  if (l.expireLe && new Date(l.expireLe).getTime() <= maintenant.getTime()) return { raison: "expiree" };
  if (l.comptes.some((c) => memeCompte(c, numero, serveur))) return { raison: "ok" };
  if (l.activationAuto && l.comptes.length < l.maxComptes) return { raison: "ok", ajouter: { numero, serveur, ajouteLe: maintenant.toISOString() } };
  return { raison: "compte-non-autorise" };
}

export type ReponseVerification = {
  valide: boolean;
  raison: Raison;
  cle: string;
  compte: string;
  nonce: string;
  horodatage: string;
  expireLe: string | null;
};

/** Chaîne signée : le robot la reconstruit à l'identique, champ par champ, séparés par « | ». */
export const chaineASigner = (r: ReponseVerification) => [r.valide ? "1" : "0", r.raison, r.cle, r.compte, r.nonce, r.horodatage, r.expireLe ?? ""].join("|");

export const signer = (secret: string, r: ReponseVerification) => createHmac("sha256", secret).update(chaineASigner(r)).digest("hex");
