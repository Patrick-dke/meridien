"use client";

import Link from "next/link";
import { useState } from "react";
import { useAncre } from "@/lib/adresse";
import { rafraichirProfil } from "@/lib/compte/session";
import { appeler, fonctionsDisponibles } from "@/lib/firebase/client";
import { useSession } from "@/lib/compte/session";
import { BandeauTest } from "../compte/Connexion";
import { Contenus, Demandes, Journal, Messages, Modules, Paiements, Parametres, Utilisateurs, VueEnsemble } from "./Sections";

const ONGLETS = [
  { id: "ensemble", libelle: "Vue d'ensemble", composant: VueEnsemble },
  { id: "utilisateurs", libelle: "Utilisateurs", composant: Utilisateurs },
  { id: "modules", libelle: "Modules et prix", composant: Modules },
  { id: "paiements", libelle: "Paiements", composant: Paiements },
  { id: "demandes", libelle: "Outils MT5", composant: Demandes },
  { id: "messages", libelle: "Messages", composant: Messages },
  { id: "contenus", libelle: "Contenus", composant: Contenus },
  { id: "journal", libelle: "Journal d'audit", composant: Journal },
  { id: "parametres", libelle: "Paramètres", composant: Parametres },
] as const;

/**
 * Administration. Cette page ne protège rien par elle-même : chaque donnée est lue et chaque action exécutée
 * par la fonction serveur `admin`, qui vérifie le rôle à chaque appel.
 */
export function Administration() {
  const s = useSession(true);
  const ancre = useAncre();
  const [choisi, setOnglet] = useState<(typeof ONGLETS)[number]["id"] | null>(null);
  const onglet = choisi ?? ONGLETS.find((o) => o.id === ancre)?.id ?? "ensemble";
  if (s.etat === "inconnu" || (s.etat === "connecte" && s.profil === null && !s.admin)) return <div className="carte h-40 animate-pulse" aria-busy="true" />;
  if (!fonctionsDisponibles)
    return <p className="carte p-6 text-ink-2">L&apos;administration s&apos;ouvrira avec la mise en service des fonctions serveur (offre Blaze de Firebase).</p>;
  if (!s.admin) return <AccesReserve connecte={s.etat === "connecte"} />;
  const Actif = ONGLETS.find((o) => o.id === onglet)!.composant;
  return (
    <div>
      <BandeauTest />
      <div role="tablist" aria-label="Sections de l'administration" className="-mx-4 mb-6 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            role="tab"
            type="button"
            aria-selected={onglet === o.id}
            onClick={() => {
              setOnglet(o.id);
              history.replaceState(null, "", `#${o.id}`);
            }}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${onglet === o.id ? "bg-brand-soft text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
          >
            {o.libelle}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        <Actif />
      </div>
    </div>
  );
}

/**
 * Hors administration. Le premier administrateur s'active ici : le serveur n'accepte que les adresses vérifiées
 * inscrites dans sa configuration (ADMIN_EMAILS) ; pour tout autre compte, la demande est refusée.
 */
function AccesReserve({ connecte }: { connecte: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="carte space-y-3 p-6 text-ink-2">
      <p>Accès réservé à l&apos;administration.</p>
      {connecte ? (
        <>
          <button
            type="button"
            className="btn btn-secondaire"
            onClick={() =>
              appeler("revendiquerAdmin")
                .then(async () => {
                  await rafraichirProfil();
                  window.location.reload();
                })
                .catch((e) => setMessage((e as Error).message))
            }
          >
            Activer mon accès administrateur
          </button>
          <p className="text-sm text-ink-3">Réservé aux adresses vérifiées que la configuration du serveur autorise.</p>
          {message ? <p className="text-sm text-warn">{message}</p> : null}
        </>
      ) : (
        <Link href="/connexion/?suite=/admin/" className="text-brand underline">
          Se connecter
        </Link>
      )}
    </div>
  );
}
