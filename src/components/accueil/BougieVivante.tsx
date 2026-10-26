"use client";

import { useEffect, useRef, useState } from "react";
import { aleatoire } from "@/lib/chartkit/outils";

type B = { o: number; h: number; l: number; c: number };

const L = 360;
const H = 220;
const N = 11;
const TICKS = 22;

function premieres(): B[] {
  const alea = aleatoire(7);
  let p = 100;
  return Array.from({ length: N - 1 }, () => {
    const o = p;
    p += (alea() - 0.48) * 3;
    return { o, c: p, h: Math.max(o, p) + alea() * 1.4, l: Math.min(o, p) - alea() * 1.4 };
  });
}

/**
 * Démonstration de l'accueil : la dernière bougie se forme sous tes yeux, cotation après cotation.
 * « Explique-moi » affiche ouverture, plus haut, plus bas et clôture sur la bougie en cours.
 */
export function BougieVivante() {
  const [serie, setSerie] = useState<B[]>(() => {
    const p = premieres();
    const o = p.at(-1)!.c;
    return [...p, { o, h: o, l: o, c: o }];
  });
  const [explique, setExplique] = useState(true);
  const [pause, setPause] = useState(false);
  const alea = useRef(aleatoire(42));
  const tick = useRef(0);
  const cadre = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const [prete, setPrete] = useState(false);

  // Les cotations ne commencent qu'une fois la page au repos, et ne tournent que si la carte est à l'écran.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    if (cadre.current) io.observe(cadre.current);
    const demarrer = () => setPrete(true);
    const id = typeof requestIdleCallback === "function" ? requestIdleCallback(demarrer, { timeout: 3000 }) : globalThis.setTimeout(demarrer, 1500);
    return () => {
      io.disconnect();
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(id as number);
      else clearTimeout(id as ReturnType<typeof setTimeout>);
    };
  }, []);

  useEffect(() => {
    if (!prete || pause || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.hidden || !visible.current) return;
      tick.current += 1;
      const clore = tick.current >= TICKS;
      if (clore) tick.current = 0;
      const variation = (alea.current() - 0.49) * 0.9;
      setSerie((s) => {
        const courante = s.at(-1)!;
        if (clore) {
          // La bougie se clôture ; une nouvelle s'ouvre au prix de clôture.
          const o = courante.c;
          return [...s.slice(1), { o, h: o, l: o, c: o }];
        }
        const c = courante.c + variation;
        return [...s.slice(0, -1), { o: courante.o, c, h: Math.max(courante.h, c), l: Math.min(courante.l, c) }];
      });
    }, 260);
    return () => window.clearInterval(id);
  }, [pause, prete]);

  const min = Math.min(...serie.map((b) => b.l)) - 1;
  const max = Math.max(...serie.map((b) => b.h)) + 1;
  const y = (v: number) => 14 + ((max - v) / (max - min)) * (H - 28);
  // Les bougies occupent la gauche ; une colonne de 100 unités à droite reçoit les étiquettes.
  const pas = (L - 124) / N;
  const x = (i: number) => 12 + pas * (i + 0.5);
  const cour = serie.at(-1)!;
  const xc = x(N - 1);
  // Étiquettes à droite, triées de haut en bas et écartées d'au moins 13 px pour rester lisibles.
  const libelles = (
    [
      ["Haut", cour.h, false],
      ["Clôture", cour.c, true],
      ["Ouverture", cour.o, false],
      ["Bas", cour.l, false],
    ] as [string, number, boolean][]
  )
    .map(([texte, v, vif]) => ({ texte, ligne: y(v), vif }))
    .sort((a, b) => a.ligne - b.ligne)
    .reduce<{ texte: string; ligne: number; vif: boolean; pos: number }[]>((acc, e) => {
      const pos = Math.max(e.ligne + 4, (acc.at(-1)?.pos ?? -Infinity) + 13);
      return [...acc, { ...e, pos: Math.min(H - 4, pos) }];
    }, []);

  return (
    <div ref={cadre} className="carte overflow-hidden p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <p className="flex items-center gap-2 text-sm font-medium text-ink">
          <span className={`size-2 rounded-full ${pause ? "bg-ink-3" : "animate-pulse bg-cyan"}`} aria-hidden="true" />
          Une bougie se forme
        </p>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setExplique((e) => !e)} aria-pressed={explique} className="btn btn-secondaire !min-h-8 !rounded-lg !px-2.5 !py-1 !text-xs">
            Explique-moi
          </button>
          <button type="button" onClick={() => setPause((p) => !p)} aria-pressed={pause} className="btn btn-secondaire !min-h-8 !rounded-lg !px-2.5 !py-1 !text-xs">
            {pause ? "Reprendre" : "Pause"}
          </button>
        </div>
      </div>
      <svg viewBox={`0 0 ${L} ${H}`} className="h-auto w-full" role="img" aria-label="Graphique en chandeliers dont la dernière bougie se forme en direct, sur des données synthétiques.">
        <rect width={L} height={H} rx={12} fill="var(--chart)" />
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={8} x2={L - 104} y1={H * f} y2={H * f} stroke="var(--line)" />
        ))}
        {serie.map((b, i) => {
          const couleur = b.c >= b.o ? "var(--bull)" : "var(--bear)";
          const enCours = i === N - 1;
          return (
            <g key={i} opacity={enCours ? 1 : 0.85}>
              <line x1={x(i)} x2={x(i)} y1={y(b.h)} y2={y(b.l)} stroke={couleur} strokeWidth={1.5} />
              <rect
                x={x(i) - pas * 0.31}
                y={y(Math.max(b.o, b.c))}
                width={pas * 0.62}
                height={Math.max(1.5, Math.abs(y(b.o) - y(b.c)))}
                rx={1.5}
                fill={couleur}
                style={{ transition: "y 240ms, height 240ms" }}
              />
            </g>
          );
        })}
        {explique ? (
          <g>
            <rect x={xc - pas * 0.55} y={y(cour.h) - 6} width={pas * 1.1} height={y(cour.l) - y(cour.h) + 12} rx={6} fill="none" stroke="var(--cyan)" strokeOpacity={0.6} strokeDasharray="4 4" />
            {libelles.map((e) => (
              <g key={e.texte}>
                <line x1={xc + pas * 0.6} x2={L - 100} y1={e.ligne} y2={e.pos - 4} stroke="var(--ink-3)" strokeOpacity={0.5} strokeDasharray="2 3" />
                <text x={L - 96} y={e.pos} fontSize={11} fill={e.vif ? "var(--cyan)" : "var(--ink-2)"}>
                  {e.texte}
                </text>
              </g>
            ))}
          </g>
        ) : null}
      </svg>
      <p className="mt-2 px-1 text-xs leading-relaxed text-ink-3">
        Chaque bougie résume une période : où le prix a ouvert, jusqu&apos;où il est monté et descendu, où il a fini. Données synthétiques.
      </p>
    </div>
  );
}
