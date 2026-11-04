"use client";

import { useSyncExternalStore } from "react";
import { lirePublic, projetFirebase } from "@/lib/firebase/client";

/**
 * Catalogue des indicateurs et robots. Les fiches vivent en base (collection `catalogueOutils`, lecture publique,
 * écriture par l'administration) : nom, fonctions, conditions, statut, prix. Les fiches ci-dessous ne servent que
 * de point de départ (bouton « Initialiser » de l'administration) et d'affichage tant que la base est vide.
 * Aucun prix n'y figure : il se fixe dans l'administration.
 */
export type CategorieOutil = "indicateur" | "robot";
export type StatutOutil = "disponible" | "sur-demande" | "en-preparation" | "suspendu";
/** achat : vendu seul · parcours : inclus avec l'achat de certains modules · etudiants : offert aux apprenants éligibles. */
export type ModeAcces = "achat" | "parcours" | "etudiants";

export type OutilCatalogue = {
  id: string;
  nom: string;
  categorie: CategorieOutil;
  plateforme: "TradingView" | "MetaTrader 5";
  resume: string;
  fonctionnalites: string[];
  conditionsUtilisation: string[];
  statut: StatutOutil;
  modesAcces: ModeAcces[];
  /** En FCFA ; null : pas de vente séparée. */
  prix: number | null;
  /** Modules dont l'achat inclut l'outil (mode « parcours »). */
  modulesInclus: string[];
  ordre: number;
  publie: boolean;
};

export const OUTILS_DE_DEPART: OutilCatalogue[] = [
  {
    id: "indicateur",
    nom: "Indicateur Méridien",
    categorie: "indicateur",
    plateforme: "TradingView",
    resume: "Indicateur privé pour TradingView, ouvert sur invitation à ton identifiant TradingView.",
    fonctionnalites: [
      "Accès nominatif : le script est ajouté à ton compte TradingView",
      "Fonctionne sur le site, l'application de bureau et l'application mobile TradingView",
      "Code source non communiqué",
      "Mises à jour incluses tant que ton accès est actif",
    ],
    conditionsUtilisation: [
      "Usage personnel : l'accès ne se partage pas",
      "Outil d'aide à l'analyse : il ne donne ni conseil, ni signal garanti",
      "Le risque de perte reste entier",
    ],
    statut: "en-preparation",
    modesAcces: ["etudiants", "achat"],
    prix: null,
    modulesInclus: [],
    ordre: 1,
    publie: true,
  },
  {
    id: "ea",
    nom: "Expert Advisor Méridien",
    categorie: "robot",
    plateforme: "MetaTrader 5",
    resume: "Robot de trading pour MetaTrader 5, distribué en version compilée sous licence.",
    fonctionnalites: [
      "Fichier compilé (.ex5) : le code source n'est pas distribué",
      "Licence liée à tes numéros de compte autorisés",
      "Vérification de licence sans jamais demander ton mot de passe de trading",
      "Installation autonome guidée, ou accompagnée sur rendez-vous",
    ],
    conditionsUtilisation: [
      "À tester d'abord sur un compte de démonstration",
      "Aucun rendement n'est garanti ; des résultats passés ne préjugent pas des résultats futurs",
      "Tu restes seul maître de ton compte, de tes réglages et de ton risque",
      "Licence personnelle, non cessible",
    ],
    statut: "en-preparation",
    modesAcces: ["etudiants", "achat"],
    prix: null,
    modulesInclus: [],
    ordre: 2,
    publie: true,
  },
];

export const libellesStatut: Record<StatutOutil, string> = {
  disponible: "Disponible",
  "sur-demande": "Sur demande",
  "en-preparation": "En préparation",
  suspendu: "Suspendu",
};

export const libellesAcces: Record<ModeAcces, string> = {
  achat: "En vente séparément",
  parcours: "Inclus avec certains modules",
  etudiants: "Offert aux apprenants qui terminent la formation",
};

type Etat = { statut: "chargement" | "pret"; outils: OutilCatalogue[] };
let etat: Etat = { statut: "chargement", outils: OUTILS_DE_DEPART };
const serveur: Etat = etat;
let lance = false;
const abonnes = new Set<() => void>();

function abonner(f: () => void) {
  abonnes.add(f);
  if (!lance) {
    lance = true;
    (async () => {
      try {
        if (!projetFirebase) throw new Error("Base non configurée");
        const liste = ((await lirePublic<OutilCatalogue[]>("catalogueOutils")) ?? []).filter((o) => o.publie !== false);
        etat = { statut: "pret", outils: liste.length ? [...liste].sort((a, b) => a.ordre - b.ordre) : OUTILS_DE_DEPART };
      } catch {
        etat = { statut: "pret", outils: OUTILS_DE_DEPART };
      }
      abonnes.forEach((g) => g());
    })();
  }
  return () => abonnes.delete(f);
}

/** Fiches publiées, de la base si elle en contient, sinon les fiches de départ. */
export function useCatalogueOutils() {
  return useSyncExternalStore(
    abonner,
    () => etat,
    () => serveur,
  );
}
