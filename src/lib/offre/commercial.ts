"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { lirePublic, obtenirDb, projetFirebase } from "@/lib/firebase/client";
import { useSession } from "@/lib/compte/session";

/** Données commerciales d'un module, lues en base (collection `modules`) : jamais écrites dans le code du site. */
export type ModuleEnVente = { id: string; titre?: string; prix: number; devise?: string; gratuit: boolean; publie: boolean; ordre?: number };
export type ParametresPublics = { paiementOuvert?: boolean; contact?: { email?: string | null; whatsapp?: string | null } };

type Etat<T> = { statut: "chargement" | "pret" | "indisponible"; donnees: T };

function source<T>(charger: () => Promise<T>, vide: T) {
  let etat: Etat<T> = { statut: "chargement", donnees: vide };
  let lance = false;
  const abonnes = new Set<() => void>();
  const serveur: Etat<T> = { statut: "chargement", donnees: vide };
  return {
    abonner(f: () => void) {
      abonnes.add(f);
      if (!lance) {
        lance = true;
        charger()
          .then((d) => (etat = { statut: "pret", donnees: d }))
          .catch(() => (etat = { statut: "indisponible", donnees: vide }))
          .finally(() => abonnes.forEach((g) => g()));
      }
      return () => abonnes.delete(f);
    },
    lire: () => etat,
    serveur: () => serveur,
  };
}

const modules = source(async () => {
  if (!projetFirebase) throw new Error("Base non configurée");
  const liste = (await lirePublic<ModuleEnVente[]>("modules")) ?? [];
  return new Map(liste.map((m) => [m.id, m]));
}, new Map<string, ModuleEnVente>());

const parametres = source(async () => (await lirePublic<ParametresPublics>("parametres/public")) ?? {}, {} as ParametresPublics);

/** Prix et publication des modules (lecture publique, sans compte ni SDK). */
export function useModulesEnVente() {
  return useSyncExternalStore(modules.abonner, modules.lire, modules.serveur);
}

export function useParametresPublics() {
  return useSyncExternalStore(parametres.abonner, parametres.lire, parametres.serveur);
}

/** Modules auxquels l'utilisateur connecté a accès (droits actifs, écrits uniquement par le serveur). */
export function useDroits(): { pret: boolean; modules: Set<string> } {
  const s = useSession();
  const uid = s.utilisateur?.uid;
  const [etat, setEtat] = useState<{ uid?: string; modules: Set<string> }>({ modules: new Set() });
  useEffect(() => {
    if (!uid) return;
    let actif = true;
    void (async () => {
      try {
        const [db, m] = await Promise.all([obtenirDb(), import("firebase/firestore/lite")]);
        const r = await m.getDocs(m.query(m.collection(db, "droits"), m.where("uid", "==", uid)));
        if (actif) setEtat({ uid, modules: new Set(r.docs.filter((d) => d.get("actif") === true).map((d) => d.get("module") as string)) });
      } catch {
        if (actif) setEtat({ uid, modules: new Set() });
      }
    })();
    return () => {
      actif = false;
    };
  }, [uid]);
  if (s.etat !== "connecte") return { pret: s.etat === "deconnecte", modules: new Set() };
  return { pret: etat.uid === uid, modules: etat.uid === uid ? etat.modules : new Set() };
}

export const formaterPrix = (fcfa: number) => `${new Intl.NumberFormat("fr-FR").format(fcfa).replace(/ | /g, " ")} FCFA`;
