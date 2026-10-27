"use client";

import { useCallback, useEffect, useState } from "react";
import { appeler } from "@/lib/firebase/client";

/** Appel d'une action d'administration (fonction `admin`, rôle vérifié côté serveur, écriture journalisée). */
export const action = <R,>(nom: string, donnees: Record<string, unknown> = {}) => appeler<R>("admin", { action: nom, ...donnees });

export function useAction<R>(nom: string, donnees: Record<string, unknown> = {}) {
  const cle = JSON.stringify(donnees);
  const [version, setVersion] = useState(0);
  const [etat, setEtat] = useState<{ cle: string; version: number; donnees: R | null; erreur: string | null } | null>(null);
  useEffect(() => {
    let actif = true;
    action<R>(nom, JSON.parse(cle)).then(
      (d) => actif && setEtat({ cle, version, donnees: d, erreur: null }),
      (e) => actif && setEtat({ cle, version, donnees: null, erreur: (e as Error).message }),
    );
    return () => {
      actif = false;
    };
  }, [nom, cle, version]);
  const recharger = useCallback(() => setVersion((v) => v + 1), []);
  const courant = etat && etat.cle === cle;
  return { donnees: courant ? etat.donnees : null, erreur: courant ? etat.erreur : null, chargement: !courant || etat.version !== version, recharger };
}

export const dateHeure = (iso?: string) => (iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—");
export const fcfa = (n: number) => `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;

export function Etat({ chargement, erreur }: { chargement: boolean; erreur: string | null }) {
  if (erreur) return <p className="rounded-lg border border-bad/50 bg-bad/10 px-3 py-2 text-sm text-ink">{erreur}</p>;
  if (chargement) return <div className="h-24 animate-pulse rounded-xl bg-surface-2" aria-busy="true" />;
  return null;
}

/** Demande un motif avant toute action sensible : il est inscrit au journal d'audit. */
export function demanderMotif(question: string): string | null {
  const m = window.prompt(`${question}\n\nMotif (obligatoire, inscrit au journal d'audit) :`);
  return m && m.trim().length >= 5 ? m.trim() : m === null ? null : (window.alert("Motif trop court (5 caractères au moins)."), null);
}

export function Tableau({ entetes, children }: { entetes: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="bg-surface-2/70 text-xs uppercase tracking-wider text-ink-3">
          <tr>
            {entetes.map((e) => (
              <th key={e} scope="col" className="px-3 py-2 font-semibold">
                {e}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export const cellule = "px-3 py-2.5 align-top";
