import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore/lite";
import type { Functions } from "firebase/functions";

/**
 * Accès à Firebase, chargé à la demande : les pages publiques n'embarquent pas le SDK.
 *
 * Deux environnements strictement séparés :
 * - TEST : NEXT_PUBLIC_EMULATEURS=1, projet fictif « demo-meridien » servi par les émulateurs locaux ;
 *   paiements simulés, aucun argent réel, aucune donnée envoyée à Google.
 * - PRODUCTION : configuration publique de l'application web Firebase (NEXT_PUBLIC_FIREBASE_*).
 */
export const emulateurs = process.env.NEXT_PUBLIC_EMULATEURS === "1";
export const REGION = "europe-west1";

const config = emulateurs
  ? { apiKey: "demo-cle-emulateurs", authDomain: "demo-meridien.firebaseapp.com", projectId: "demo-meridien", appId: "demo-meridien" }
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    };

export const projetFirebase = config.projectId;
/** Faux tant que l'application web n'est pas enregistrée : les comptes sont alors annoncés comme bientôt disponibles. */
export const comptesDisponibles = Boolean(config.apiKey && config.projectId);
const HOTE = "127.0.0.1";

let app: Promise<FirebaseApp> | null = null;
let auth: Promise<Auth> | null = null;
let db: Promise<Firestore> | null = null;
let fonctions: Promise<Functions> | null = null;

function application() {
  return (app ??= import("firebase/app").then(({ initializeApp, getApps }) => getApps()[0] ?? initializeApp(config)));
}

export function obtenirAuth() {
  return (auth ??= Promise.all([application(), import("firebase/auth")]).then(([a, m]) => {
    const instance = m.initializeAuth(a, { persistence: [m.indexedDBLocalPersistence, m.browserLocalPersistence], popupRedirectResolver: m.browserPopupRedirectResolver });
    instance.languageCode = "fr";
    if (emulateurs) m.connectAuthEmulator(instance, `http://${HOTE}:9099`, { disableWarnings: true });
    return instance;
  }));
}

/** Firestore « lite » : lectures et écritures ponctuelles, sans écoute en temps réel, trois fois plus léger. */
export function obtenirDb() {
  return (db ??= Promise.all([application(), import("firebase/firestore/lite")]).then(([a, m]) => {
    const instance = m.getFirestore(a);
    if (emulateurs) m.connectFirestoreEmulator(instance, HOTE, 8080);
    return instance;
  }));
}

function obtenirFonctions() {
  return (fonctions ??= Promise.all([application(), import("firebase/functions"), obtenirAuth()]).then(([a, m]) => {
    const instance = m.getFunctions(a, REGION);
    if (emulateurs) m.connectFunctionsEmulator(instance, HOTE, 5001);
    return instance;
  }));
}

export class ErreurServeur extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

const MESSAGES: Record<string, string> = {
  "functions/unavailable": "Le service ne répond pas. Vérifie ta connexion puis réessaie.",
  "functions/internal": "Le service est momentanément indisponible. Réessaie dans un instant.",
  "functions/not-found": "Service introuvable : il n'est peut-être pas encore mis en service.",
  "functions/unauthenticated": "Connecte-toi pour continuer.",
  "functions/deadline-exceeded": "Le service met trop de temps à répondre. Réessaie.",
};

/** Appelle une fonction serveur ; les erreurs arrivent en français, prêtes à afficher. */
export async function appeler<R = unknown>(nom: string, donnees?: unknown): Promise<R> {
  const [f, { httpsCallable }] = await Promise.all([obtenirFonctions(), import("firebase/functions")]);
  try {
    const r = await httpsCallable(f, nom, { timeout: 60_000 })(donnees);
    return r.data as R;
  } catch (e) {
    const code = (e as { code?: string }).code ?? "inconnu";
    // Le SDK ajoute le statut HTTP (« … [400] ») : inutile pour l'apprenant.
    const message = ((e as Error).message ?? "").replace(/\s*\[\d{3}\]$/, "").trim();
    // Les erreurs métier (invalid-argument, failed-precondition…) portent une phrase rédigée côté serveur ;
    // les erreurs techniques n'ont qu'un code (« internal », « NOT_FOUND ») : on les traduit.
    const technique = !message || /^[A-Za-z_-]+$/.test(message);
    throw new ErreurServeur(technique ? (MESSAGES[code] ?? "Erreur inattendue. Réessaie.") : message, code);
  }
}

/** Lecture publique par l'API REST de Firestore, sans charger le SDK (prix et paramètres affichés). */
export async function lirePublic<T = Record<string, unknown>>(chemin: string): Promise<T | null> {
  if (!projetFirebase) return null;
  const base = emulateurs ? `http://${HOTE}:8080/v1` : "https://firestore.googleapis.com/v1";
  const rep = await fetch(`${base}/projects/${projetFirebase}/databases/(default)/documents/${chemin}${emulateurs ? "" : `?key=${config.apiKey}`}`);
  if (rep.status === 404) return null;
  if (!rep.ok) throw new Error(`Lecture impossible (${rep.status})`);
  const corps = (await rep.json()) as { documents?: { name: string; fields?: Record<string, ValeurRest> }[]; fields?: Record<string, ValeurRest> };
  if (corps.documents) return corps.documents.map((d) => ({ id: d.name.split("/").pop(), ...decoder(d.fields ?? {}) })) as T;
  return decoder(corps.fields ?? {}) as T;
}

type ValeurRest = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  mapValue?: { fields?: Record<string, ValeurRest> };
  arrayValue?: { values?: ValeurRest[] };
  timestampValue?: string;
};

function valeur(v: ValeurRest): unknown {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("mapValue" in v) return decoder(v.mapValue?.fields ?? {});
  if ("arrayValue" in v) return (v.arrayValue?.values ?? []).map(valeur);
  return null;
}
const decoder = (f: Record<string, ValeurRest>) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, valeur(v)]));
