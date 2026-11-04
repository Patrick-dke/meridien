"use client";

import Link from "next/link";
import { useState } from "react";
import { useAncre } from "@/lib/adresse";
import { rafraichirProfil } from "@/lib/compte/session";
import { appeler, fonctionsDisponibles } from "@/lib/firebase/client";
import { useSession } from "@/lib/compte/session";
import { BandeauTest } from "../compte/Connexion";
import { Alerte } from "../compte/Formulaire";
import { Contenus, Journal, Messages, Modules, Paiements, Parametres, ResultatsExamens, Utilisateurs, VueEnsemble } from "./Sections";
import { CatalogueOutils, DemandesOutils, Licences } from "./SectionsOutils";

/** `direct` : onglet utilisable sans fonctions serveur (lectures et écritures contrôlées par les règles Firestore). */
const TOUS = [
  { id: "ensemble", libelle: "Vue d'ensemble", composant: VueEnsemble, direct: true },
  { id: "utilisateurs", libelle: "Utilisateurs", composant: Utilisateurs, direct: true },
  { id: "modules", libelle: "Modules et prix", composant: Modules, direct: true },
  { id: "paiements", libelle: "Paiements", composant: Paiements, direct: false },
  { id: "outils", libelle: "Outils", composant: CatalogueOutils, direct: false },
  { id: "demandes", libelle: "Demandes d'accès", composant: DemandesOutils, direct: false },
  { id: "licences", libelle: "Licences", composant: Licences, direct: false },
  { id: "examens", libelle: "Examens", composant: ResultatsExamens, direct: false },
  { id: "messages", libelle: "Messages", composant: Messages, direct: false },
  { id: "contenus", libelle: "Contenus", composant: Contenus, direct: true },
  { id: "journal", libelle: "Journal d'audit", composant: Journal, direct: true },
  { id: "parametres", libelle: "Paramètres", composant: Parametres, direct: false },
] as const;
const ONGLETS = TOUS.filter((o) => fonctionsDisponibles || o.direct);

/**
 * Administration. Cette page ne protège rien par elle-même : chaque donnée est lue et chaque action exécutée
 * par la fonction serveur `admin`, qui vérifie le rôle à chaque appel, ou, sans fonctions, par la base sous le
 * contrôle de ses règles.
 */
export function Administration() {
  const s = useSession(true);
  const ancre = useAncre();
  const [choisi, setOnglet] = useState<(typeof TOUS)[number]["id"] | null>(null);
  const onglet = choisi ?? ONGLETS.find((o) => o.id === ancre)?.id ?? "ensemble";
  if (s.etat === "inconnu" || (s.etat === "connecte" && s.profil === null && !s.admin)) return <div className="carte h-40 animate-pulse" aria-busy="true" />;
  if (!s.admin) return <AccesReserve uid={s.utilisateur?.uid ?? null} />;
  const Actif = ONGLETS.find((o) => o.id === onglet)!.composant;
  return (
    <div>
      <BandeauTest />
      {!fonctionsDisponibles ? (
        <div className="mb-5">
          <Alerte ton="info">
            Administration sans fonctions serveur : utilisateurs, accès aux modules, prix, contenus et journal. Les paiements, les outils, les examens, les
            messages, la suspension des comptes et la nomination d&apos;administrateurs s&apos;ouvriront avec les fonctions (offre Blaze de Firebase).
          </Alerte>
        </div>
      ) : null}
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
 * Hors administration. Avec les fonctions, le premier administrateur s'active ici : le serveur n'accepte que les
 * adresses vérifiées inscrites dans sa configuration (ADMIN_EMAILS). Sans fonctions, il se désigne dans la console
 * Firebase (document admins/<identifiant>) : la page affiche l'identifiant du compte à y reporter.
 */
function AccesReserve({ uid }: { uid: string | null }) {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="carte space-y-3 p-6 text-ink-2">
      <p>Accès réservé à l&apos;administration.</p>
      {uid && !fonctionsDisponibles ? (
        <>
          <p className="text-sm">
            Ce compte n&apos;a pas le rôle d&apos;administrateur. Le propriétaire du projet le désigne dans la console Firebase, avec l&apos;identifiant de ce
            compte :
          </p>
          <p className="break-all rounded-lg bg-surface-2 px-3 py-2 font-mono text-sm text-ink">{uid}</p>
        </>
      ) : uid ? (
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
