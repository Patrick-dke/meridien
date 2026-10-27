"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { User } from "firebase/auth";
import { comptesDisponibles, obtenirAuth, obtenirDb } from "@/lib/firebase/client";
import { ETAT_VIDE, fusionnerEtats, lireEtat } from "@/lib/progression/etat";
import { ecouterProgression, etatActuel, remplacerEtat } from "@/lib/progression/store";

export type Profil = { nom: string; email: string; telephone: string | null; photo: string | null; statut?: "actif" | "suspendu" };
export type Utilisateur = { uid: string; email: string | null; emailVerifie: boolean; nom: string | null; fournisseurs: string[] };
export type Session = { etat: "inconnu" | "deconnecte" | "connecte"; utilisateur: Utilisateur | null; profil: Profil | null; admin: boolean };

/** Indice local « une session existe » : sans lui, aucune page ne charge le SDK d'authentification. */
const INDICE = "meridien:session";
const VIDE: Session = { etat: "inconnu", utilisateur: null, profil: null, admin: false };

let session: Session = VIDE;
let demarree = false;
const abonnes = new Set<() => void>();
let arreterSynchro: (() => void) | null = null;
const jetonsRenouveles = new Set<string>();

function publier(s: Session) {
  session = s;
  abonnes.forEach((f) => f());
}

function indice(present?: boolean) {
  try {
    if (present === undefined) return window.localStorage.getItem(INDICE) === "1";
    if (present) window.localStorage.setItem(INDICE, "1");
    else window.localStorage.removeItem(INDICE);
  } catch {
    // Stockage bloqué : la session se retrouve quand même à l'ouverture d'une page de compte.
  }
  return false;
}

const versUtilisateur = (u: User): Utilisateur => ({
  uid: u.uid,
  email: u.email,
  emailVerifie: u.emailVerified,
  nom: u.displayName,
  fournisseurs: u.providerData.map((p) => p.providerId),
});

/** Charge l'authentification et suit l'état de connexion. Sans effet si déjà fait. */
export function demarrerSession() {
  if (demarree || typeof window === "undefined") return;
  demarree = true;
  if (!comptesDisponibles) {
    publier({ ...VIDE, etat: "deconnecte" });
    return;
  }
  void obtenirAuth().then(async (auth) => {
    const { onIdTokenChanged } = await import("firebase/auth");
    onIdTokenChanged(auth, async (u) => {
      if (!u) {
        indice(false);
        arreterSynchro?.();
        arreterSynchro = null;
        publier({ ...VIDE, etat: "deconnecte" });
        return;
      }
      indice(true);
      // Adresse vérifiée depuis l'émission du jeton : on le renouvelle (une fois), sinon le serveur la croit encore
      // non vérifiée. Le renouvellement relance cet écouteur ; en cas d'échec, on continue avec le jeton actuel.
      if (u.emailVerified && !jetonsRenouveles.has(u.uid)) {
        try {
          if ((await u.getIdTokenResult()).claims.email_verified !== true) {
            jetonsRenouveles.add(u.uid);
            await u.getIdToken(true);
            return;
          }
        } catch {
          // Réseau instable : la session s'ouvre quand même ; le serveur redemandera la vérification si besoin.
        }
      }
      const base = { etat: "connecte" as const, utilisateur: versUtilisateur(u), profil: session.utilisateur?.uid === u.uid ? session.profil : null, admin: session.admin };
      publier(base);
      const [profil, admin] = await Promise.all([lireProfil(u.uid), estAdmin(u)]);
      publier({ ...base, profil, admin });
      if (!arreterSynchro) arreterSynchro = synchroniserProgression(u.uid);
    });
  });
}

async function lireProfil(uid: string): Promise<Profil | null> {
  try {
    const [db, { doc, getDoc }] = await Promise.all([obtenirDb(), import("firebase/firestore/lite")]);
    const d = await getDoc(doc(db, "utilisateurs", uid));
    return d.exists() ? (d.data() as Profil) : null;
  } catch {
    return null;
  }
}

async function estAdmin(u: User) {
  try {
    const jeton = await u.getIdTokenResult();
    if (jeton.claims.admin === true) return true;
    const [db, { doc, getDoc }] = await Promise.all([obtenirDb(), import("firebase/firestore/lite")]);
    return (await getDoc(doc(db, "admins", u.uid))).exists();
  } catch {
    return false;
  }
}

/** Relit le profil après une modification. */
export async function rafraichirProfil() {
  const u = session.utilisateur;
  if (!u) return;
  const auth = await obtenirAuth();
  if (auth.currentUser) {
    await auth.currentUser.reload();
    // Le jeton porte l'état « adresse vérifiée » : on le renouvelle pour que le serveur voie le changement.
    await auth.currentUser.getIdToken(true);
  }
  publier({ ...session, utilisateur: auth.currentUser ? versUtilisateur(auth.currentUser) : u, profil: await lireProfil(u.uid) });
}

function sAbonner(f: () => void) {
  abonnes.add(f);
  return () => abonnes.delete(f);
}

/**
 * Session courante. `exiger` charge l'authentification tout de suite (pages de compte, quiz, paiement) ;
 * sinon, elle n'est chargée que si l'appareil a déjà été connecté.
 */
export function useSession(exiger = false): Session {
  useEffect(() => {
    if (exiger || indice()) demarrerSession();
    else if (session.etat === "inconnu") publier({ ...VIDE, etat: "deconnecte" });
  }, [exiger]);
  return useSyncExternalStore(sAbonner, () => session, () => VIDE);
}

/**
 * Progression : à la connexion, celle de l'appareil et celle du compte sont fusionnées (rien n'est perdu),
 * puis chaque changement local est recopié sur le compte, regroupé toutes les 4 secondes.
 */
function synchroniserProgression(uid: string) {
  let minuteur: ReturnType<typeof setTimeout> | null = null;
  let actif = true;
  const envoyer = async () => {
    minuteur = null;
    try {
      const [db, { doc, setDoc }] = await Promise.all([obtenirDb(), import("firebase/firestore/lite")]);
      await setDoc(doc(db, "progressions", uid), { etat: JSON.parse(JSON.stringify(etatActuel())), majLe: new Date().toISOString() });
    } catch {
      // Hors ligne ou compte suspendu : la progression reste sur l'appareil et repartira au prochain changement.
    }
  };
  let desabonner: (() => void) | null = null;
  void (async () => {
    try {
      const [db, { doc, getDoc }] = await Promise.all([obtenirDb(), import("firebase/firestore/lite")]);
      const d = await getDoc(doc(db, "progressions", uid));
      const distant = d.exists() ? lireEtat(JSON.stringify(d.get("etat"))) : null;
      if (!actif) return;
      remplacerEtat(fusionnerEtats(etatActuel(), distant ?? ETAT_VIDE));
      await envoyer();
    } catch {
      // Lecture impossible : on n'écrase rien, la synchronisation reprendra à la prochaine connexion.
      return;
    }
    desabonner = ecouterProgression(() => {
      if (!minuteur) minuteur = setTimeout(envoyer, 4000);
    });
  })();
  return () => {
    actif = false;
    desabonner?.();
    if (minuteur) clearTimeout(minuteur);
  };
}
