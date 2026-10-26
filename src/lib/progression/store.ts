import { useSyncExternalStore } from "react";
import { ajouterScoresConcepts, ETAT_VIDE, lireEtat, type Etat, type Profil, type Reglages } from "./etat";

/*
 * Progression enregistrée dans le navigateur (localStorage), sans compte ni serveur.
 * Toute lecture ou écriture est protégée : navigation privée, stockage plein ou bloqué
 * ne doivent jamais casser l'interface.
 */

const CLE = "meridien:progression";
const abonnes = new Set<() => void>();
let cache: Etat | null = null;

function charger(): Etat {
  if (cache) return cache;
  let texte: string | null = null;
  try {
    texte = window.localStorage.getItem(CLE);
  } catch {
    texte = null;
  }
  cache = lireEtat(texte) ?? ETAT_VIDE;
  return cache;
}

function enregistrer(etat: Etat) {
  cache = etat;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // Stockage indisponible : la progression reste en mémoire pour cette visite.
  }
  for (const f of abonnes) f();
}

function sAbonner(f: () => void) {
  abonnes.add(f);
  const surStockage = (e: StorageEvent) => {
    if (e.key === CLE) {
      cache = null;
      f();
    }
  };
  window.addEventListener("storage", surStockage);
  return () => {
    abonnes.delete(f);
    window.removeEventListener("storage", surStockage);
  };
}

/** État courant ; ETAT_VIDE pendant le rendu serveur et l'hydratation. */
export function useProgression(): Etat {
  return useSyncExternalStore(sAbonner, charger, () => ETAT_VIDE);
}

/** État réel, à lire dans un effet : pendant l'hydratation, useProgression renvoie encore l'état vide. */
export function etatActuel(): Etat {
  return charger();
}

export function mettreAJour(f: (e: Etat) => Etat) {
  enregistrer(f(charger()));
}

const maintenant = () => new Date().toISOString();

export function ouvrirChapitre(slug: string) {
  mettreAJour((e) => ({
    ...e,
    derniereVisite: maintenant(),
    dernierChapitre: slug,
    chapitres: e.chapitres[slug]
      ? e.chapitres
      : { ...e.chapitres, [slug]: { statut: "en-cours", etape: 0, debut: maintenant(), tempsS: 0, tentatives: 0 } },
  }));
}

export function allerEtape(slug: string, etape: number) {
  mettreAJour((e) => {
    const c = e.chapitres[slug];
    if (!c || c.etape === etape) return e;
    return { ...e, chapitres: { ...e.chapitres, [slug]: { ...c, etape } } };
  });
}

export function ajouterTemps(slug: string, secondes: number) {
  mettreAJour((e) => {
    const c = e.chapitres[slug];
    if (!c) return e;
    return { ...e, derniereVisite: maintenant(), chapitres: { ...e.chapitres, [slug]: { ...c, tempsS: c.tempsS + secondes } } };
  });
}

/** Enregistre un quiz : score global, scores par concept et, si le seuil est atteint, la fin du chapitre. */
export function enregistrerQuiz(slug: string, score: number, parConcept: { concept: string; score: number }[], reussi: boolean) {
  mettreAJour((e) => {
    const c = e.chapitres[slug] ?? { statut: "en-cours" as const, etape: 0, debut: maintenant(), tempsS: 0, tentatives: 0 };
    const misAJour = {
      ...c,
      tentatives: c.tentatives + 1,
      dernierScore: score,
      meilleurScore: Math.max(score, c.meilleurScore ?? 0),
      statut: reussi || c.statut === "termine" ? ("termine" as const) : c.statut,
      fin: reussi && !c.fin ? maintenant() : c.fin,
    };
    return ajouterScoresConcepts({ ...e, chapitres: { ...e.chapitres, [slug]: misAJour } }, parConcept, maintenant());
  });
}

export function basculerFavori(slug: string) {
  mettreAJour((e) => ({
    ...e,
    favoris: e.favoris.includes(slug) ? e.favoris.filter((s) => s !== slug) : [...e.favoris, slug],
  }));
}

export function ecrireNote(slug: string, texte: string) {
  mettreAJour((e) => {
    const notes = { ...e.notes };
    if (texte.trim()) notes[slug] = texte.slice(0, 20000);
    else delete notes[slug];
    return { ...e, notes };
  });
}

export function changerReglages(r: Partial<Reglages>) {
  mettreAJour((e) => ({ ...e, reglages: { ...e.reglages, ...r } }));
}

export function enregistrerProfil(p: Omit<Profil, "date">) {
  mettreAJour((e) => ({ ...e, profil: { ...p, date: maintenant() } }));
}

export function exporter(): string {
  return JSON.stringify(charger(), null, 2);
}

/** Remplace la progression par un fichier exporté ; refuse tout fichier d'un autre format. */
export function importer(texte: string): boolean {
  const etat = lireEtat(texte);
  if (!etat) return false;
  enregistrer(etat);
  return true;
}

export function effacerTout() {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    // Rien à effacer si le stockage est indisponible.
  }
  enregistrer(ETAT_VIDE);
}
