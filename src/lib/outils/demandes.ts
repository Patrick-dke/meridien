"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/compte/session";
import { appeler, fonctionsDisponibles, obtenirDb } from "@/lib/firebase/client";
import type { ModeAcces } from "./catalogue";

/**
 * Demandes d'accès aux outils et licences, vues de l'apprenant. L'éligibilité et les demandes passent par la fonction
 * `outils` (vérifiées côté serveur) ; les licences se lisent directement, la base ne les montrant qu'à leur titulaire.
 */

export type StatutDemande = "en_attente" | "accordee" | "refusee";
export type Demande = { id: string; outil: string; mode: ModeAcces | null; statut: StatutDemande; creeLe: string; note: string | null };
export type Eligibilite = {
  eligible: boolean;
  scoreMin: number;
  modules: { module: string; achete: boolean; chapitres: number; valides: number }[];
  demandes: Demande[];
  dejaDemande?: boolean;
};

export type CompteMT5 = { numero: string; serveur: string };
export type DonneesDemande = {
  outil: string;
  mode: ModeAcces;
  identifiantTradingView?: string;
  comptes?: CompteMT5[];
  installation?: "autonome" | "assistee";
  consentementAssistance?: boolean;
  message?: string;
};

export type Licence = {
  id: string;
  outil: string;
  cle: string;
  statut: "active" | "suspendue" | "revoquee";
  comptes: (CompteMT5 & { ajouteLe: string })[];
  maxComptes: number;
  activationAuto: boolean;
  expireLe: string | null;
  creeLe: string;
  telechargement?: string | null;
  derniereVerification: { le: string; compte: string; serveur: string; raison: string } | null;
};

export const libellesStatutDemande: Record<StatutDemande, string> = {
  en_attente: "Demande en cours d'examen",
  accordee: "Accès accordé",
  refusee: "Demande refusée",
};

/** Éligibilité et demandes de l'apprenant connecté (null tant que rien n'est chargé ou si les fonctions sont fermées). */
export function useDemandesOutils() {
  const s = useSession();
  const uid = s.utilisateur?.uid;
  const [etat, setEtat] = useState<{ uid: string; donnees: Eligibilite | null; erreur: string | null } | null>(null);
  useEffect(() => {
    if (!uid || !fonctionsDisponibles) return;
    let actif = true;
    appeler<Eligibilite>("outils", { action: "eligibilite" }).then(
      (d) => actif && setEtat({ uid, donnees: d, erreur: null }),
      (e) => actif && setEtat({ uid, donnees: null, erreur: (e as Error).message }),
    );
    return () => {
      actif = false;
    };
  }, [uid]);
  const courant = etat && etat.uid === uid ? etat : null;
  const demander = useCallback(
    async (d: DonneesDemande) => {
      const r = await appeler<Eligibilite>("outils", { action: "demander", ...d });
      if (uid) setEtat({ uid, donnees: r, erreur: null });
      return r;
    },
    [uid],
  );
  return { session: s, donnees: courant?.donnees ?? null, erreur: courant?.erreur ?? null, chargement: Boolean(uid && fonctionsDisponibles && !courant), demander };
}

/** Licences de l'utilisateur (lecture directe, autorisée par les règles pour leur seul titulaire). */
export async function lireMesLicences(uid: string): Promise<Licence[]> {
  const [db, m] = await Promise.all([obtenirDb(), import("firebase/firestore/lite")]);
  const r = await m.getDocs(m.query(m.collection(db, "licences"), m.where("uid", "==", uid)));
  return r.docs.map((d) => ({ id: d.id, ...d.data() }) as Licence).sort((a, b) => b.creeLe.localeCompare(a.creeLe));
}
