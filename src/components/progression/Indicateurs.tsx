"use client";

import Link from "next/link";
import { useState } from "react";
import { ressource } from "@/lib/chemin";
import { useProgression } from "@/lib/progression/store";
import { IconeCoche } from "../ui/Icones";
import { Jauge } from "../ui/Progression";

/** Badge « Terminé » ou « En cours » d'un chapitre. */
export function EtatChapitre({ slug }: { slug: string }) {
  const c = useProgression().chapitres[slug];
  if (!c) return null;
  return c.statut === "termine" ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-ok/50 px-2 py-0.5 text-xs font-medium text-ok">
      <IconeCoche className="size-3.5" /> Terminé
    </span>
  ) : (
    <span className="rounded-full border border-info/50 px-2 py-0.5 text-xs font-medium text-info">En cours</span>
  );
}

/** Progression d'une liste de chapitres (le parcours, un module). */
export function ProgressionListe({ slugs, libelle }: { slugs: string[]; libelle: string }) {
  const p = useProgression();
  const faits = slugs.filter((s) => p.chapitres[s]?.statut === "termine").length;
  const pct = slugs.length ? Math.round((faits / slugs.length) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-ink-2">{libelle}</span>
        <span className="font-mono text-ink tabular">
          {faits}/{slugs.length}
        </span>
      </div>
      <Jauge valeur={pct / 100} libelle={libelle} />
    </div>
  );
}

/** Bouton « Reprendre » si une progression existe, sinon « Commencer ». */
export function BoutonReprendre({ parcours, titres }: { parcours: string[]; titres: Record<string, string> }) {
  const p = useProgression();
  const suivant =
    (p.dernierChapitre && p.chapitres[p.dernierChapitre]?.statut !== "termine" ? p.dernierChapitre : undefined) ??
    parcours.find((s) => p.chapitres[s]?.statut !== "termine");
  const commence = Object.keys(p.chapitres).length > 0;
  if (!commence || !suivant) {
    return (
      <Link href="/commencer/" className="btn btn-primaire btn-grand">
        Commencer sans compte
      </Link>
    );
  }
  return (
    <Link href={`/chapitre/${suivant}/`} className="btn btn-primaire btn-grand !flex-col !items-start !gap-0">
      <span className="text-xs font-medium text-white/80">Reprendre</span>
      <span className="max-w-[16rem] truncate text-base font-semibold">{titres[suivant] ?? "Mon parcours"}</span>
    </Link>
  );
}

/** Met en cache les pages du parcours pour les consulter sans connexion (nécessite le service worker). */
export function BoutonHorsLigne({ chemins }: { chemins: string[] }) {
  const [etat, setEtat] = useState<"repos" | "encours" | "ok" | "impossible">("repos");
  const lancer = async () => {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      setEtat("impossible");
      return;
    }
    setEtat("encours");
    try {
      await Promise.all(chemins.map((c) => fetch(ressource(c), { cache: "reload" })));
      setEtat("ok");
    } catch {
      setEtat("impossible");
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={lancer}
        disabled={etat === "encours"}
        className="rounded-lg border border-line-strong px-4 py-2.5 text-sm font-medium text-ink hover:border-ink-3 disabled:opacity-60"
      >
        {etat === "encours" ? "Téléchargement…" : "Rendre le parcours disponible hors ligne"}
      </button>
      <span className="text-sm text-ink-3" aria-live="polite">
        {etat === "ok"
          ? "C'est fait : les chapitres s'ouvriront même sans connexion."
          : etat === "impossible"
            ? "Impossible pour l'instant : recharge la page une fois, puis réessaie."
            : null}
      </span>
    </div>
  );
}
