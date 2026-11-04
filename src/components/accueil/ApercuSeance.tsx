"use client";

import { useEffect, useState } from "react";

/**
 * Aperçu d'une séance, en tête de l'accueil : un graphique en chandeliers (données synthétiques) que la leçon
 * annote étape par étape — structure, cassure, déséquilibre, liquidité — avec la légende qui suit, comme dans
 * une capsule. Un SVG, aucune bibliothèque ; en animations réduites, l'état final s'affiche d'emblée.
 */

type B = [o: number, h: number, l: number, c: number];

// Une tendance haussière construite pour la leçon : creux (3), sommet (8), creux plus haut (12), cassure (15),
// déséquilibre entre les bougies 14 et 16, plus hauts égaux (19 et 22), puis prise de cette liquidité (25).
const BOUGIES: B[] = [
  [108, 109, 106.5, 107], [107, 107.5, 104.8, 105.2], [105.2, 106, 103.6, 104], [104, 104.6, 102.2, 103.8],
  [103.8, 106.4, 103.5, 106], [106, 108.2, 105.6, 107.9], [107.9, 110.1, 107.2, 109.6], [109.6, 112, 109, 111.4],
  [111.4, 113.2, 110.6, 111], [111, 111.5, 108.6, 109], [109, 109.8, 107.1, 107.6], [107.6, 108.4, 106, 107.9],
  [107.9, 108.2, 105.8, 107.6], [107.6, 110.4, 107.3, 110.1], [110.1, 112.6, 109.8, 112.3], [112.3, 117.4, 112.1, 117],
  [117, 118.6, 114.2, 118.2], [118.2, 119.4, 116.8, 117.2], [117.2, 118, 115.6, 116.4], [116.4, 120.1, 116, 119.6],
  [119.6, 119.9, 117.4, 117.8], [117.8, 118.3, 115.9, 116.6], [116.6, 120.15, 116.3, 118.4], [118.4, 118.9, 116.1, 116.5],
  [116.5, 117.2, 113.9, 114.4], [114.4, 121.6, 114, 121.2], [121.2, 121.8, 118.9, 119.3], [119.3, 120.4, 118.2, 120],
];

const ETAPES = [
  { titre: "Structure", texte: "Un creux, un sommet, puis un creux plus haut : la tendance se lit dans ses points pivots." },
  { titre: "Cassure", texte: "Une clôture au-dessus du dernier sommet confirme la cassure de structure (BOS)." },
  { titre: "Déséquilibre", texte: "Autour de la bougie de cassure, les mèches voisines ne se recouvrent pas : ce vide est une FVG." },
  { titre: "Liquidité", texte: "Deux plus hauts égaux concentrent des ordres stop. Le prix vient les chercher." },
];

const L = 640;
const H = 300;
const G = 14;
const D = 96;
const BAS = 22;
const MIN = 101;
const MAX = 123;
const pas = (L - G - D) / BOUGIES.length;
const x = (i: number) => G + pas * (i + 0.5);
const y = (p: number) => 12 + ((MAX - p) / (MAX - MIN)) * (H - 12 - BAS);

const DUREE_ETAPE = 3400;

export function ApercuSeance() {
  // -1 : bougies seules ; 0 à 3 : étapes de la leçon.
  const [etape, setEtape] = useState(-1);
  const [fixe, setFixe] = useState(false);

  useEffect(() => {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.leger === "oui";
    if (reduit) {
      const t = window.setTimeout(() => {
        setFixe(true);
        setEtape(3);
      }, 0);
      return () => window.clearTimeout(t);
    }
    let courant = -1;
    let minuterie = 0;
    const avancer = () => {
      // Après la dernière étape, une pause plus longue, puis la leçon reprend (les bougies restent).
      courant = courant >= 3 ? 0 : courant + 1;
      setEtape(courant);
      minuterie = window.setTimeout(avancer, courant === 3 ? DUREE_ETAPE * 1.8 : DUREE_ETAPE);
    };
    minuterie = window.setTimeout(avancer, 1500);
    // Onglet en arrière-plan : la leçon s'arrête, sans rien consommer.
    const visibilite = () => {
      window.clearTimeout(minuterie);
      if (!document.hidden) minuterie = window.setTimeout(avancer, 800);
    };
    document.addEventListener("visibilitychange", visibilite);
    return () => {
      window.clearTimeout(minuterie);
      document.removeEventListener("visibilitychange", visibilite);
    };
  }, []);

  const vu = (n: number) => etape >= n;
  const legende = ETAPES[Math.max(0, etape)];

  return (
    <figure className="relative" aria-label="Aperçu d'une leçon : lecture d'une structure de marché sur un graphique en chandeliers">
      <div className="carte eleve overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <p className="min-w-0 truncate text-xs text-ink-2">
            <span className="font-mono text-ink-3">M6 · </span>Swings et structure (HH, HL, LH, LL)
          </p>
          <p className="shrink-0 font-mono text-xs text-ink-3 tabular" aria-hidden="true">
            {String(Math.max(1, etape + 1)).padStart(2, "0")}/04
          </p>
        </div>

        <svg viewBox={`0 0 ${L} ${H}`} className="block w-full bg-chart" role="img" aria-label="Graphique synthétique annoté : structure, cassure, FVG et liquidité">
          {[105, 110, 115, 120].map((p) => (
            <g key={p}>
              <line x1={G} x2={L - D + 8} y1={y(p)} y2={y(p)} stroke="var(--line)" strokeWidth={1} />
              <text x={L - D + 14} y={y(p) + 4} fontSize={10.5} fill="var(--ink-3)" className="font-mono">
                {p.toFixed(2).replace(".", ",")}
              </text>
            </g>
          ))}

          {/* FVG : sous les bougies, pour qu'elles restent lisibles. */}
          <g style={{ opacity: vu(2) ? 1 : 0, transition: "opacity 500ms" }}>
            <rect x={x(14)} y={y(114.2)} width={x(27) - x(14) + pas / 2} height={y(112.6) - y(114.2)} fill="var(--fvg)" fillOpacity={0.16} />
            <line x1={x(14)} x2={x(27) + pas / 2} y1={y(114.2)} y2={y(114.2)} stroke="var(--fvg)" strokeWidth={1} strokeOpacity={0.6} />
            <line x1={x(14)} x2={x(27) + pas / 2} y1={y(112.6)} y2={y(112.6)} stroke="var(--fvg)" strokeWidth={1} strokeOpacity={0.6} />
          </g>

          {BOUGIES.map(([o, h, l, c], i) => {
            const hausse = c >= o;
            const couleur = hausse ? "var(--bull)" : "var(--bear)";
            const corpsHaut = y(Math.max(o, c));
            const accent = (vu(1) && i === 15) || (vu(3) && i === 25);
            return (
              <g key={i} className="bougie-forme" style={{ transformOrigin: `${x(i)}px ${y(o)}px`, animationDelay: `${120 + i * 40}ms` }}>
                <line x1={x(i)} x2={x(i)} y1={y(h)} y2={y(l)} stroke={couleur} strokeWidth={1.3} />
                <rect
                  x={x(i) - pas * 0.32}
                  y={corpsHaut}
                  width={pas * 0.64}
                  height={Math.max(1.2, y(Math.min(o, c)) - corpsHaut)}
                  fill={couleur}
                  stroke={accent ? "var(--ink)" : "none"}
                  strokeWidth={accent ? 1.5 : 0}
                />
              </g>
            );
          })}

          {/* 1. Structure : creux, sommet, creux plus haut. */}
          <g style={{ opacity: vu(0) ? 1 : 0, transition: "opacity 450ms" }} fontSize={10.5} fill="var(--ink)" className="font-mono">
            <polyline
              points={`${x(3)},${y(102.2)} ${x(8)},${y(113.2)} ${x(12)},${y(105.8)} ${x(15)},${y(117.4)}`}
              fill="none"
              stroke="var(--ink-2)"
              strokeWidth={1.2}
              strokeDasharray="3 3"
            />
            <text x={x(3)} y={y(102.2) + 14} textAnchor="middle">
              L
            </text>
            <text x={x(8)} y={y(113.2) - 7} textAnchor="middle">
              H
            </text>
            <text x={x(12)} y={y(105.8) + 14} textAnchor="middle">
              HL
            </text>
          </g>

          {/* 2. Cassure de structure. */}
          <g style={{ opacity: vu(1) ? 1 : 0, transition: "opacity 450ms" }}>
            <line x1={x(8)} x2={x(15) + pas / 2} y1={y(113.2)} y2={y(113.2)} stroke="var(--ink)" strokeWidth={1.4} />
            <rect x={x(10.2)} y={y(113.2) - 17} width={36} height={14} fill="var(--ink)" />
            <text x={x(10.2) + 18} y={y(113.2) - 6.5} textAnchor="middle" fontSize={10} fontWeight={600} fill="var(--bg)" className="font-mono">
              BOS
            </text>
          </g>

          {/* 3. Étiquette de la FVG. */}
          <g style={{ opacity: vu(2) ? 1 : 0, transition: "opacity 500ms" }}>
            <text x={x(17)} y={y(112.6) + 14} fontSize={10.5} fontWeight={600} fill="var(--fvg)" className="font-mono">
              FVG 112,60 – 114,20
            </text>
          </g>

          {/* 4. Liquidité au-dessus des plus hauts égaux, puis prise. */}
          <g style={{ opacity: vu(3) ? 1 : 0, transition: "opacity 450ms" }}>
            <line x1={x(19)} x2={L - D + 8} y1={y(120.12)} y2={y(120.12)} stroke="var(--accent)" strokeWidth={1.6} strokeDasharray="5 3" />
            <text x={x(19) - 4} y={y(120.12) - 7} fontSize={10.5} fontWeight={600} fill="var(--gold)" className="font-mono">
              liquidité
            </text>
            <circle cx={x(25)} cy={y(121.6)} r={5.5} fill="none" stroke="var(--accent)" strokeWidth={1.6} />
          </g>
        </svg>

        <div className="border-t border-line px-4 pb-3.5 pt-3">
          <div className="flex gap-1" aria-hidden="true">
            {ETAPES.map((e, i) => (
              <span key={e.titre} className="h-[3px] flex-1 overflow-hidden bg-line">
                <span
                  className="block h-full bg-jauge"
                  style={{
                    width: etape > i || (fixe && etape >= i) ? "100%" : etape === i ? "100%" : "0%",
                    transition: etape === i && !fixe ? `width ${DUREE_ETAPE}ms linear` : "width 200ms",
                  }}
                />
              </span>
            ))}
          </div>
          <p className="mt-2.5 min-h-[2.8em] text-sm leading-snug text-ink" aria-live="polite">
            <span className="font-semibold">{legende.titre}. </span>
            <span className="text-ink-2">{legende.texte}</span>
          </p>
        </div>
      </div>

      {/* Deuxième plan : un calcul de risque posé en marge, qui glisse moins vite que la leçon (profondeur). */}
      <div
        className="parallaxe carte eleve absolute -bottom-10 -left-4 hidden w-52 p-3.5 sm:block lg:-left-10"
        style={{ ["--amplitude" as string]: "-14px" }}
        aria-hidden="true"
      >
        <p className="surtitre">Taille de position</p>
        <dl className="mt-2 space-y-1 font-mono text-xs tabular">
          <div className="flex justify-between">
            <dt className="text-ink-3">Risque</dt>
            <dd className="text-ink">1 % · 50 USD</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-3">Stop</dt>
            <dd className="text-ink">20 pips</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-1">
            <dt className="text-ink-3">Lots</dt>
            <dd className="font-semibold text-ink">0,25</dd>
          </div>
        </dl>
      </div>
      <figcaption className="sr-only">Données synthétiques, à but pédagogique.</figcaption>
    </figure>
  );
}
