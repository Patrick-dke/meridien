"use client";

import { useSyncExternalStore } from "react";
import type { EntreeJournal } from "./journal";
import type { Compte } from "./simulateur";

/**
 * Compte d'entraînement et journal, gardés sur l'appareil (localStorage). Toute lecture ou écriture est protégée :
 * navigation privée, stockage plein ou bloqué ne doivent jamais casser l'outil.
 */
function magasin<T>(cle: string, vide: T) {
  const abonnes = new Set<() => void>();
  let cache: T | undefined;
  const lire = (): T => {
    if (cache !== undefined) return cache;
    try {
      const brut = window.localStorage.getItem(cle);
      cache = brut ? (JSON.parse(brut) as T) : vide;
    } catch {
      cache = vide;
    }
    return cache;
  };
  const ecrire = (valeur: T) => {
    cache = valeur;
    try {
      window.localStorage.setItem(cle, JSON.stringify(valeur));
    } catch {
      // Stockage indisponible : la valeur reste en mémoire pour cette visite.
    }
    abonnes.forEach((f) => f());
  };
  const sAbonner = (f: () => void) => {
    abonnes.add(f);
    return () => abonnes.delete(f);
  };
  return { lire, ecrire, sAbonner, vide };
}

const compte = magasin<Compte | null>("meridien:compte-entrainement", null);
const journal = magasin<EntreeJournal[]>("meridien:journal", []);

export function useCompteEntrainement(): [Compte | null, (c: Compte | null) => void] {
  return [useSyncExternalStore(compte.sAbonner, compte.lire, () => null), compte.ecrire];
}

export function useJournal(): [EntreeJournal[], (j: EntreeJournal[]) => void] {
  return [useSyncExternalStore(journal.sAbonner, journal.lire, () => journal.vide), journal.ecrire];
}

export const ajouterAuJournal = (entrees: EntreeJournal[]) => journal.ecrire([...journal.lire(), ...entrees]);
