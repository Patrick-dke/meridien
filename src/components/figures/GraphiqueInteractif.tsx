"use client";

import { useRef, useState } from "react";
import { formatPrix } from "@/lib/chartkit/outils";
import type { SceneBougies } from "@/lib/chartkit/types";
import { IconePrecedent, IconeRejouer, IconeSuivant } from "../ui/Icones";
import { DROITE, etapesScene, GAUCHE, GraphiqueBougies, L } from "./GraphiqueBougies";

/**
 * Graphique de cours à explorer : on survole ou on touche une bougie pour lire ses quatre prix (les flèches
 * du clavier font de même), on rejoue sa formation, et on avance dans la démonstration étape par étape.
 */
export function GraphiqueInteractif({ scene }: { scene: SceneBougies }) {
  const total = etapesScene(scene);
  const [etape, setEtape] = useState(total);
  const [selection, setSelection] = useState<number | undefined>(undefined);
  const [tour, setTour] = useState(0);
  const cadre = useRef<HTMLDivElement>(null);
  const n = scene.bougies.length;
  const visibles = scene.revele ? (scene.revele[Math.min(etape, scene.revele.length - 1)] ?? n) : n;

  const indiceDepuis = (clientX: number) => {
    const r = cadre.current?.getBoundingClientRect();
    if (!r) return undefined;
    const xv = ((clientX - r.left) / r.width) * L;
    const i = Math.floor((xv - GAUCHE) / ((L - GAUCHE - DROITE) / n));
    return i >= 0 && i < visibles ? i : undefined;
  };

  const clavier = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const depart = selection ?? (e.key === "ArrowLeft" ? visibles : -1);
    setSelection(Math.max(0, Math.min(visibles - 1, depart + (e.key === "ArrowRight" ? 1 : -1))));
  };

  const b = selection !== undefined ? scene.bougies[selection] : undefined;
  const d = scene.decimales;

  return (
    <div>
      <div
        ref={cadre}
        tabIndex={0}
        role="group"
        aria-label={`${scene.description} Graphique explorable : flèches gauche et droite pour lire chaque bougie.`}
        onPointerMove={(e) => setSelection(indiceDepuis(e.clientX))}
        onPointerDown={(e) => setSelection(indiceDepuis(e.clientX))}
        onPointerLeave={(e) => e.pointerType === "mouse" && setSelection(undefined)}
        onKeyDown={clavier}
        className="cursor-crosshair touch-pan-y rounded-xl"
      >
        <GraphiqueBougies key={tour} scene={scene} etape={etape} selection={selection} formation={tour > 0 ? { depuis: 0, pasMs: 55 } : undefined} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="min-h-6 flex-1 font-mono text-xs text-ink-2 tabular" aria-live="polite">
          {b ? (
            <>
              <span className="text-ink">Bougie {selection! + 1}</span> · O {formatPrix(b.o, d)} · H {formatPrix(b.h, d)} · B {formatPrix(b.l, d)} · C {formatPrix(b.c, d)} ·{" "}
              <span className={b.c >= b.o ? "text-bull" : "text-bear"}>{b.c >= b.o ? "hausse" : "baisse"}</span>
            </>
          ) : (
            <span className="font-sans text-ink-3">Touche ou survole une bougie pour lire ses prix.</span>
          )}
        </p>
        {total > 0 ? (
          <div className="flex items-center gap-1" role="group" aria-label="Étapes de la démonstration">
            <button type="button" onClick={() => setEtape((x) => Math.max(0, x - 1))} disabled={etape === 0} aria-label="Étape précédente de la figure" className="btn btn-discret !min-h-9 !px-2">
              <IconePrecedent className="size-4" />
            </button>
            <span className="min-w-16 text-center text-xs text-ink-3">
              Étape {etape + 1}/{total + 1}
            </span>
            <button type="button" onClick={() => setEtape((x) => Math.min(total, x + 1))} disabled={etape === total} aria-label="Étape suivante de la figure" className="btn btn-discret !min-h-9 !px-2">
              <IconeSuivant className="size-4" />
            </button>
          </div>
        ) : null}
        <button type="button" onClick={() => setTour((t) => t + 1)} className="btn btn-discret !min-h-9 !px-2.5 text-xs">
          <IconeRejouer className="size-4" /> Rejouer
        </button>
      </div>
    </div>
  );
}
