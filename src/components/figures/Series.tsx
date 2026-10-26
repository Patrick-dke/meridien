import { plusLongueSerie } from "@/lib/trading/calculs";
import type { SceneDistribution } from "@/lib/chartkit/types";

const L = 480;
const H = 270;
const G = 40;
const D = 16;

/** Une suite de résultats en R et le capital cumulé : même une méthode gagnante connaît des séries de pertes. */
export function Series({ scene, etape = Number.POSITIVE_INFINITY }: { scene: SceneDistribution; etape?: number }) {
  const r = scene.resultats;
  const cumul = r.reduce<number[]>((acc, v) => [...acc, (acc.at(-1) ?? 0) + v], []);
  const min = Math.min(0, ...cumul, ...r);
  const max = Math.max(0, ...cumul, ...r);
  const y = (v: number) => 22 + ((max - v) / (max - min)) * (H - 70);
  const pas = (L - G - D) / r.length;
  const x = (i: number) => G + pas * (i + 0.5);
  const serie = plusLongueSerie(r);
  const total = cumul.at(-1) ?? 0;

  return (
    <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label={scene.description} className="h-auto w-full">
      <title>{scene.description}</title>
      <rect x={0} y={0} width={L} height={H} rx={12} fill="var(--chart)" />
      <line x1={G} x2={L - D} y1={y(0)} y2={y(0)} stroke="var(--line-strong)" />
      <text x={G - 6} y={y(0) + 4} textAnchor="end" fontSize={12} fill="var(--ink-3)">0</text>
      {r.map((v, i) => (
        <rect
          key={i}
          x={x(i) - pas * 0.32}
          y={v >= 0 ? y(v) : y(0)}
          width={pas * 0.64}
          height={Math.abs(y(v) - y(0))}
          rx={2}
          fill={v >= 0 ? "var(--bull)" : "var(--bear)"}
          fillOpacity={0.75}
        />
      ))}
      {etape >= 1 ? (
        <polyline
          className="apparition"
          points={cumul.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
          fill="none"
          stroke="var(--gold)"
          strokeWidth={2.5}
        />
      ) : null}
      {etape >= 2 ? (
        <g className="apparition">
          <text x={G} y={H - 30} fontSize={13} fill="var(--ink-2)" className="tabular">
            {r.length} trades · {r.filter((v) => v > 0).length} gagnants · total {total > 0 ? "+" : ""}
            {total.toLocaleString("fr-FR")} R
          </text>
          <text x={G} y={H - 10} fontSize={13} fontWeight={600} fill="var(--bear)" className="tabular">
            Plus longue série de pertes : {serie} trades d&apos;affilée
          </text>
        </g>
      ) : null}
    </svg>
  );
}
