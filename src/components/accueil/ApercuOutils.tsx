"use client";

import Link from "next/link";
import { libellesStatut, useCatalogueOutils } from "@/lib/outils/catalogue";
import { IllustrationOutil } from "../outils/IllustrationOutil";

/** Les outils du catalogue (base, ou fiches de départ), en vitrine courte sur l'accueil. */
export function ApercuOutils() {
  const { outils } = useCatalogueOutils();
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {outils.slice(0, 2).map((o) => (
        <li key={o.id} className="revele">
          <Link href={`/outils/#${o.id}`} className="carte carte-lien block overflow-hidden">
            <div className="border-b border-line">
              <IllustrationOutil categorie={o.categorie} />
            </div>
            <div className="p-5">
              <p className="surtitre">
                {o.categorie === "indicateur" ? "Indicateur" : "Robot"} · {o.plateforme}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-ink">{o.nom}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{o.resume}</p>
              <p className="mt-3 text-sm font-medium text-ink-3">{libellesStatut[o.statut]}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
