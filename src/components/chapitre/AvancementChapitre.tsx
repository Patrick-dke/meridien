"use client";

import { useProgression } from "@/lib/progression/store";
import { Anneau } from "../ui/Progression";

/** Anneau d'avancement du chapitre, dans son en-tête : étapes vues, ou plein et doré s'il est validé. */
export function AvancementChapitre({ slug, etapes }: { slug: string; etapes: number }) {
  const c = useProgression().chapitres[slug];
  const termine = c?.statut === "termine";
  const valeur = !c ? 0 : termine ? 1 : (c.etape + 1) / etapes;
  return (
    <Anneau valeur={valeur} taille={72} epaisseur={6} libelle="Avancement du chapitre" teinte={termine ? "var(--gold)" : undefined}>
      <span className="text-center leading-none">
        <span className="block font-mono text-base font-semibold text-ink">{Math.round(valeur * 100)}%</span>
        <span className="mt-0.5 block text-[0.6rem] text-ink-3">{termine ? "validé" : c ? "en cours" : "à lire"}</span>
      </span>
    </Anneau>
  );
}
