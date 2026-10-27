"use client";

import { basePath } from "@/lib/chemin";
import { appeler, obtenirAuth, obtenirDb } from "@/lib/firebase/client";
import { normaliserTelephone } from "./telephone";
import { demarrerSession, rafraichirProfil } from "./session";

/** Messages Firebase traduits ; volontairement vagues sur l'existence d'un compte (pas d'énumération d'adresses). */
const ERREURS: Record<string, string> = {
  "auth/invalid-credential": "Adresse e-mail ou mot de passe incorrect.",
  "auth/wrong-password": "Adresse e-mail ou mot de passe incorrect.",
  "auth/user-not-found": "Adresse e-mail ou mot de passe incorrect.",
  "auth/invalid-email": "Adresse e-mail invalide.",
  "auth/email-already-in-use": "Impossible de créer ce compte avec cette adresse. Si elle est déjà à toi, connecte-toi ou réinitialise ton mot de passe.",
  "auth/weak-password": "Mot de passe trop faible : 8 caractères au moins, avec une lettre et un chiffre.",
  "auth/too-many-requests": "Trop de tentatives. Patiente quelques minutes avant de réessayer.",
  "auth/network-request-failed": "Connexion impossible. Vérifie ton accès à Internet.",
  "auth/popup-closed-by-user": "Fenêtre Google fermée avant la fin.",
  "auth/cancelled-popup-request": "Fenêtre Google fermée avant la fin.",
  "auth/user-disabled": "Ce compte est suspendu. Contacte l'équipe Méridien.",
  "auth/requires-recent-login": "Par sécurité, saisis à nouveau ton mot de passe.",
  "auth/account-exists-with-different-credential":
    "Un compte existe déjà avec cette adresse. Connecte-toi d'abord avec ton mot de passe, puis associe Google depuis Mon compte → Paramètres du profil.",
  "auth/credential-already-in-use": "Ce compte Google est déjà associé à un autre compte Méridien.",
  "auth/provider-already-linked": "Google est déjà associé à ton compte.",
  "auth/operation-not-allowed": "Ce mode de connexion n'est pas encore activé.",
  "auth/unauthorized-domain": "Connexion Google non autorisée sur cette adresse du site.",
  "auth/missing-password": "Saisis ton mot de passe.",
};

export class ErreurCompte extends Error {}
export const traduire = (e: unknown) => new ErreurCompte(ERREURS[(e as { code?: string }).code ?? ""] ?? (e instanceof ErreurCompte ? e.message : "Une erreur est survenue. Réessaie."));

/** 8 caractères au moins, au moins une lettre et un chiffre. */
export const motDePasseValide = (m: string) => m.length >= 8 && /[A-Za-zÀ-ÿ]/.test(m) && /\d/.test(m);

const lienRetour = (chemin: string) => ({ url: `${window.location.origin}${basePath}${chemin}`, handleCodeInApp: false });

async function creerProfil(uid: string, d: { nom: string; email: string; telephone: string | null }) {
  const [db, { doc, getDoc, setDoc }] = await Promise.all([obtenirDb(), import("firebase/firestore/lite")]);
  const ref = doc(db, "utilisateurs", uid);
  if ((await getDoc(ref)).exists()) return;
  const date = new Date().toISOString();
  await setDoc(ref, { nom: d.nom, nomMinuscule: d.nom.toLowerCase(), email: d.email, emailMinuscule: d.email.toLowerCase(), telephone: d.telephone, photo: null, creeLe: date, majLe: date });
}

export async function inscrire(d: { nom: string; email: string; telephone: string; motDePasse: string }) {
  const nom = d.nom.trim().replace(/\s+/g, " ");
  if (nom.length < 2) throw new ErreurCompte("Indique ton nom complet.");
  const telephone = d.telephone.trim() ? normaliserTelephone(d.telephone) : null;
  if (d.telephone.trim() && !telephone) throw new ErreurCompte("Numéro camerounais attendu : 9 chiffres commençant par 6 (exemple : 6 70 00 00 00).");
  if (!motDePasseValide(d.motDePasse)) throw new ErreurCompte(ERREURS["auth/weak-password"]);
  demarrerSession();
  const [auth, m] = await Promise.all([obtenirAuth(), import("firebase/auth")]);
  try {
    const { user } = await m.createUserWithEmailAndPassword(auth, d.email.trim(), d.motDePasse);
    await m.updateProfile(user, { displayName: nom });
    await creerProfil(user.uid, { nom, email: user.email!, telephone });
    await m.sendEmailVerification(user, lienRetour("/compte/"));
    await rafraichirProfil();
  } catch (e) {
    throw traduire(e);
  }
}

export async function connecter(email: string, motDePasse: string) {
  demarrerSession();
  const [auth, m] = await Promise.all([obtenirAuth(), import("firebase/auth")]);
  try {
    await m.signInWithEmailAndPassword(auth, email.trim(), motDePasse);
  } catch (e) {
    throw traduire(e);
  }
}

/**
 * « Continuer avec Google ». Si l'adresse appartient déjà à un compte protégé par mot de passe, rien n'est
 * fusionné automatiquement : l'utilisateur se connecte d'abord avec son mot de passe, puis associe Google.
 */
export async function connecterGoogle() {
  demarrerSession();
  const [auth, m] = await Promise.all([obtenirAuth(), import("firebase/auth")]);
  const fournisseur = new m.GoogleAuthProvider();
  fournisseur.setCustomParameters({ prompt: "select_account" });
  try {
    const { user } = await m.signInWithPopup(auth, fournisseur);
    await creerProfil(user.uid, { nom: user.displayName?.trim() || user.email!.split("@")[0], email: user.email!, telephone: null });
    await rafraichirProfil();
  } catch (e) {
    if ((e as { code?: string }).code === "auth/popup-blocked") {
      await m.signInWithRedirect(auth, fournisseur);
      return;
    }
    throw traduire(e);
  }
}

export async function demanderReinitialisation(email: string) {
  const [auth, m] = await Promise.all([obtenirAuth(), import("firebase/auth")]);
  try {
    await m.sendPasswordResetEmail(auth, email.trim(), lienRetour("/connexion/"));
  } catch (e) {
    // Même réponse que l'adresse existe ou non : on ne révèle pas qui a un compte.
    if ((e as { code?: string }).code !== "auth/user-not-found") throw traduire(e);
  }
}

export async function renvoyerVerification() {
  const [auth, m] = await Promise.all([obtenirAuth(), import("firebase/auth")]);
  if (!auth.currentUser) throw new ErreurCompte("Connecte-toi d'abord.");
  try {
    await m.sendEmailVerification(auth.currentUser, lienRetour("/compte/"));
  } catch (e) {
    throw traduire(e);
  }
}

export async function deconnecter() {
  const [auth, m] = await Promise.all([obtenirAuth(), import("firebase/auth")]);
  await m.signOut(auth);
}

export async function deconnecterPartout() {
  await appeler("deconnecterPartout");
  await deconnecter();
}

async function utilisateurCourant() {
  const auth = await obtenirAuth();
  if (!auth.currentUser) throw new ErreurCompte("Connecte-toi d'abord.");
  return auth.currentUser;
}

export async function modifierProfil(d: { nom: string; telephone: string; photo?: string | null }) {
  const u = await utilisateurCourant();
  const nom = d.nom.trim().replace(/\s+/g, " ");
  if (nom.length < 2 || nom.length > 80) throw new ErreurCompte("Nom complet : entre 2 et 80 caractères.");
  const telephone = d.telephone.trim() ? normaliserTelephone(d.telephone) : null;
  if (d.telephone.trim() && !telephone) throw new ErreurCompte("Numéro camerounais attendu : 9 chiffres commençant par 6.");
  const [db, { doc, updateDoc }, m] = await Promise.all([obtenirDb(), import("firebase/firestore/lite"), import("firebase/auth")]);
  const maj: Record<string, unknown> = { nom, nomMinuscule: nom.toLowerCase(), telephone, email: u.email, emailMinuscule: u.email?.toLowerCase(), majLe: new Date().toISOString() };
  if (d.photo !== undefined) maj.photo = d.photo;
  try {
    await creerProfil(u.uid, { nom, email: u.email!, telephone });
    await updateDoc(doc(db, "utilisateurs", u.uid), maj);
    await m.updateProfile(u, { displayName: nom });
  } catch (e) {
    throw traduire(e);
  }
  await rafraichirProfil();
}

async function reauthentifier(motDePasse: string) {
  const [u, m] = await Promise.all([utilisateurCourant(), import("firebase/auth")]);
  try {
    if (u.providerData.some((p) => p.providerId === "password")) {
      await m.reauthenticateWithCredential(u, m.EmailAuthProvider.credential(u.email!, motDePasse));
    } else {
      await m.reauthenticateWithPopup(u, new m.GoogleAuthProvider());
    }
  } catch (e) {
    throw traduire(e);
  }
  return { u, m };
}

/** Le changement d'adresse ne prend effet qu'après un clic sur le lien envoyé à la NOUVELLE adresse. */
export async function changerEmail(nouvelle: string, motDePasse: string) {
  const { u, m } = await reauthentifier(motDePasse);
  try {
    await m.verifyBeforeUpdateEmail(u, nouvelle.trim(), lienRetour("/compte/profil/"));
  } catch (e) {
    throw traduire(e);
  }
}

export async function changerMotDePasse(actuel: string, nouveau: string) {
  if (!motDePasseValide(nouveau)) throw new ErreurCompte(ERREURS["auth/weak-password"]);
  const { u, m } = await reauthentifier(actuel);
  try {
    await m.updatePassword(u, nouveau);
  } catch (e) {
    throw traduire(e);
  }
}

/** Association explicite de Google à un compte existant : la personne prouve qu'elle contrôle les deux. */
export async function associerGoogle() {
  const [u, m] = await Promise.all([utilisateurCourant(), import("firebase/auth")]);
  try {
    await m.linkWithPopup(u, new m.GoogleAuthProvider());
  } catch (e) {
    throw traduire(e);
  }
  await rafraichirProfil();
}

/** Réduit une photo à 256 px (JPEG) dans le navigateur : quelques dizaines de Ko, stockés avec le profil. */
export async function reduirePhoto(fichier: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(fichier.type)) throw new ErreurCompte("Formats acceptés : JPEG, PNG ou WebP.");
  if (fichier.size > 8 * 1024 * 1024) throw new ErreurCompte("Image trop lourde (8 Mo au plus).");
  const image = await createImageBitmap(fichier);
  const cote = 256;
  const echelle = Math.max(cote / image.width, cote / image.height);
  const toile = document.createElement("canvas");
  toile.width = cote;
  toile.height = cote;
  const ctx = toile.getContext("2d")!;
  const l = image.width * echelle;
  const h = image.height * echelle;
  ctx.drawImage(image, (cote - l) / 2, (cote - h) / 2, l, h);
  for (const qualite of [0.85, 0.7, 0.55]) {
    const url = toile.toDataURL("image/jpeg", qualite);
    if (url.length < 110_000) return url;
  }
  throw new ErreurCompte("Image impossible à réduire suffisamment.");
}
