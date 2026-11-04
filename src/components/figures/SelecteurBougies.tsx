"use client";

import { useRef, useState } from "react";
import { scenes } from "@/content/scenes";
import { formatPrix } from "@/lib/chartkit/outils";
import { DROITE, GAUCHE, GraphiqueBougies, L } from "./GraphiqueBougies";

/**
 * Graphique où l'on touche des bougies (exercices et quiz). Au clavier : flèches pour parcourir, Entrée pour
 * choisir. Après correction, `bonnes` colore les bougies attendues (vert) et les erreurs (rouge).
 */
export function SelecteurBougies({
  scene: id,
  etape,
  choix,
  onChange,
  desactive = false,
  bonnes,
}: {
  scene: string;
  etape?: number;
  choix: number[];
  onChange: (choix: number[]) => void;
  desactive?: boolean;
  bonnes?: number[];
}) {
  const s = scenes[id];
  const cadre = useRef<HTMLDivElement>(null);
  const [survol, setSurvol] = useState<number | undefined>(undefined);
  if (!s || s.kind !== "bougies") return null;
  const n = s.bougies.length;
  const e = etape ?? Number.POSITIVE_INFINITY;
  const visibles = s.revele ? (s.revele[Math.min(e, s.revele.length - 1)] ?? n) : n;
  const pas = (L - GAUCHE - DROITE) / n;
  const indice = (clientX: number) => {
    const r = cadre.current?.getBoundingClientRect();
    if (!r) return undefined;
    const i = Math.floor((((clientX - r.left) / r.width) * L - GAUCHE) / pas);
    return i >= 0 && i < visibles ? i : undefined;
  };
  const basculer = (i: number) => {
    if (desactive) return;
    onChange(choix.includes(i) ? choix.filter((x) => x !== i) : [...choix, i].sort((a, b) => a - b));
  };
  const marques = bonnes ? [...new Set([...choix, ...bonnes])] : choix;
  const couleur = (i: number) => (!bonnes ? "border-brand bg-brand/10" : bonnes.includes(i) ? (choix.includes(i) ? "border-ok bg-ok/15" : "border-ok/70 border-dashed bg-ok/5") : "border-bad bg-bad/15");
  const b = survol !== undefined ? s.bougies[survol] : undefined;
  return (
    <div>
      <div
        ref={cadre}
        role="group"
        tabIndex={desactive ? -1 : 0}
        aria-label={`${s.description} Touche une bougie pour la choisir ; flèches gauche et droite puis Entrée au clavier.`}
        className={`relative touch-pan-y rounded-xl ${desactive ? "" : "cursor-pointer"}`}
        onPointerMove={(ev) => setSurvol(indice(ev.clientX))}
        onPointerLeave={() => setSurvol(undefined)}
        onClick={(ev) => {
          const i = indice(ev.clientX);
          if (i !== undefined) basculer(i);
        }}
        onKeyDown={(ev) => {
          if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
            ev.preventDefault();
            const depart = survol ?? (ev.key === "ArrowLeft" ? visibles : -1);
            setSurvol(Math.max(0, Math.min(visibles - 1, depart + (ev.key === "ArrowRight" ? 1 : -1))));
          } else if ((ev.key === "Enter" || ev.key === " ") && survol !== undefined) {
            ev.preventDefault();
            basculer(survol);
          }
        }}
      >
        <GraphiqueBougies scene={s} etape={e} selection={survol} />
        {marques.map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-1 rounded-md border-2 ${couleur(i)}`}
            style={{ left: `${((GAUCHE + pas * i) / L) * 100}%`, width: `${(pas / L) * 100}%` }}
          />
        ))}
      </div>
      <p className="mt-2 min-h-5 font-mono text-xs text-ink-2" aria-live="polite">
        {b ? `Bougie ${survol! + 1} · O ${formatPrix(b.o, s.decimales)} · H ${formatPrix(b.h, s.decimales)} · B ${formatPrix(b.l, s.decimales)} · C ${formatPrix(b.c, s.decimales)}` : ""}
      </p>
      <p className="text-sm text-ink-2">{choix.length ? `Choisie${choix.length > 1 ? "s" : ""} : ${choix.map((i) => `bougie ${i + 1}`).join(", ")}` : "Aucune bougie choisie."}</p>
    </div>
  );
}
