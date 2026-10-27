"use client";

import Link from "next/link";
import { useSession } from "@/lib/compte/session";
import { IconeProfil } from "../ui/Icones";

/** Accès au compte dans l'en-tête ; sans session connue, aucun SDK n'est chargé (simple lien). */
export function BoutonCompte() {
  const s = useSession();
  if (s.etat === "connecte") {
    const nom = s.profil?.nom ?? s.utilisateur?.nom ?? s.utilisateur?.email ?? "";
    return (
      <Link href="/compte/" className="btn btn-discret !min-h-10 gap-2 !px-2" aria-label="Mon compte">
        {s.profil?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.profil.photo} alt="" className="size-7 rounded-full object-cover" />
        ) : (
          <span className="grid size-7 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand" aria-hidden="true">
            {nom.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-32 truncate text-sm sm:inline">{nom.split(" ")[0]}</span>
      </Link>
    );
  }
  return (
    <Link href="/connexion/" className="btn btn-secondaire !min-h-10 !px-3 text-sm">
      <IconeProfil className="size-4 sm:hidden" />
      <span className="hidden sm:inline">Se connecter</span>
      <span className="sr-only sm:hidden">Se connecter</span>
    </Link>
  );
}
