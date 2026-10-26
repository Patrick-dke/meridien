import type { SceneLevier } from "@/lib/chartkit/types";

const euros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

/** Même capital, leviers différents : taille de position et perte pour une même variation de prix. */
export function Levier({ scene, etape = Number.POSITIVE_INFINITY }: { scene: SceneLevier; etape?: number }) {
  const maxLevier = Math.max(...scene.leviers);
  const LIGNE = 74;
  const H = 40 + scene.leviers.length * LIGNE;
  return (
    <svg viewBox={`0 0 480 ${H}`} role="img" aria-label={scene.description} className="h-auto w-full">
      <title>{scene.description}</title>
      <rect x={0} y={0} width={480} height={H} rx={12} fill="var(--chart)" />
      <text x={20} y={26} fontSize={13} fill="var(--ink-3)">
        Capital : {euros(scene.capital)} · variation du prix : −{scene.variationPct} %
      </text>
      {scene.leviers.map((l, i) => {
        if (i > etape) return null;
        const position = scene.capital * l;
        const perte = (position * scene.variationPct) / 100;
        const partCapital = (perte / scene.capital) * 100;
        const y = 44 + i * LIGNE;
        const largeur = Math.max(4, (l / maxLevier) * 300);
        const grave = partCapital >= 20;
        return (
          <g key={l} className="apparition">
            <text x={20} y={y + 18} fontSize={14} fontWeight={600} fill="var(--ink)">Levier 1:{l}</text>
            <rect x={120} y={y + 4} width={largeur} height={18} rx={4} fill="var(--brand)" fillOpacity={0.55} />
            <text x={128 + largeur} y={y + 18} fontSize={12.5} fill="var(--ink-2)" className="tabular">
              {largeur > 250 ? "" : `position ${euros(position)}`}
            </text>
            {largeur > 250 ? (
              <text x={128} y={y + 18} fontSize={12.5} fill="#fff" className="tabular">position {euros(position)}</text>
            ) : null}
            <text x={120} y={y + 48} fontSize={13} fill={grave ? "var(--bad)" : "var(--ink-2)"} fontWeight={grave ? 600 : 400} className="tabular">
              Perte : {euros(perte)}, soit {partCapital.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} % du capital
            </text>
          </g>
        );
      })}
    </svg>
  );
}
