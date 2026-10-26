"use client";

import { useProgression } from "@/lib/progression/store";
import { Anneau } from "../ui/Progression";

/** Avancement d'une académie ou d'un module : chapitres terminés sur publiés, et l'action qui en découle. */
export function AvancementEnsemble({ titre, publies, total }: { titre: string; publies: string[]; total: number }) {
  const p = useProgression();
  const termines = publies.filter((s) => p.chapitres[s]?.statut === "termine").length;
  const commences = publies.some((s) => p.chapitres[s]);
  const avance = publies.length ? termines / publies.length : 0;
  return (
    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
      <p className={`text-sm font-semibold ${publies.length ? "text-brand" : "text-ink-3"}`}>
        {publies.length === 0
          ? `${total} chapitres en préparation`
          : commences
            ? `Continuer · ${termines}/${publies.length} terminés`
            : `Explorer · ${publies.length} disponible${publies.length > 1 ? "s" : ""} sur ${total}`}
      </p>
      {publies.length ? (
        <Anneau valeur={avance} taille={46} libelle={`Avancement de ${titre}`}>
          <span className="font-mono text-[0.65rem] text-ink-2">{Math.round(avance * 100)}%</span>
        </Anneau>
      ) : null}
    </div>
  );
}
