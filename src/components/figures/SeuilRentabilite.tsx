import { seuilRentabilite } from "@/lib/trading/calculs";

const L = 480;
const H = 290;
const G = 52;
const D = 16;
const HAUT = 20;
const BAS = 44;
const R_MIN = 0.5;
const R_MAX = 4;
const Y_MAX = 70;

/** Taux de réussite minimal (sans frais) selon le ratio rendement/risque. */
export function SeuilRentabilite({ description, etape = Number.POSITIVE_INFINITY }: { description: string; etape?: number }) {
  const x = (r: number) => G + ((r - R_MIN) / (R_MAX - R_MIN)) * (L - G - D);
  const y = (pct: number) => HAUT + ((Y_MAX - pct) / Y_MAX) * (H - HAUT - BAS);
  const points: string[] = [];
  for (let r = R_MIN; r <= R_MAX + 1e-9; r += 0.05) points.push(`${x(r)},${y(seuilRentabilite(r) * 100)}`);
  const courbe = `M ${points.join(" L ")}`;
  const zone = `${courbe} L ${x(R_MAX)},${y(Y_MAX)} L ${x(R_MIN)},${y(Y_MAX)} Z`;
  const reperes = [1, 2, 3];

  return (
    <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label={description} className="h-auto w-full">
      <title>{description}</title>
      <rect x={0} y={0} width={L} height={H} rx={12} fill="var(--chart)" />
      {[0, 10, 20, 30, 40, 50, 60, 70].map((v) => (
        <g key={v}>
          <line x1={G} x2={L - D} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={G - 8} y={y(v) + 4.5} textAnchor="end" fontSize={12.5} fill="var(--ink-3)" className="tabular">{v} %</text>
        </g>
      ))}
      {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map((r) => (
        <text key={r} x={x(r)} y={H - BAS + 18} textAnchor="middle" fontSize={12.5} fill="var(--ink-3)" className="tabular">
          {r.toLocaleString("fr-FR")}
        </text>
      ))}
      <text x={(G + L - D) / 2} y={H - 8} textAnchor="middle" fontSize={12.5} fill="var(--ink-2)">
        Ratio rendement/risque (R)
      </text>
      {etape >= 2 ? (
        <g className="apparition">
          <path d={zone} fill="var(--ok)" fillOpacity={0.1} />
          <text x={x(3)} y={y(58)} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ok)">
            Au-dessus : gagnant, avant frais
          </text>
        </g>
      ) : null}
      <path d={courbe} fill="none" stroke="var(--brand)" strokeWidth={2.5} />
      {etape >= 1
        ? reperes.map((r) => {
            const pct = seuilRentabilite(r) * 100;
            return (
              <g key={r} className="apparition">
                <circle cx={x(r)} cy={y(pct)} r={5} fill="var(--gold)" />
                <text x={x(r) + 8} y={y(pct) - 8} fontSize={13} fontWeight={600} fill="var(--gold)" className="tabular">
                  {pct.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %
                </text>
              </g>
            );
          })
        : null}
    </svg>
  );
}
