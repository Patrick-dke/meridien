import { regrouper } from "@/lib/chartkit/outils";
import type { Bougie, SceneUnitesDeTemps } from "@/lib/chartkit/types";

const H = 270;
const HAUT = 20;
const BAS = 50;

/** Les mêmes échanges vus en petites bougies, puis regroupés en bougies plus longues. */
export function UnitesDeTemps({ scene, etape = Number.POSITIVE_INFINITY }: { scene: SceneUnitesDeTemps; etape?: number }) {
  const longues = regrouper(scene.bougies, scene.groupe);
  const min = Math.min(...scene.bougies.map((b) => b.l));
  const max = Math.max(...scene.bougies.map((b) => b.h));
  const marge = (max - min) * 0.08;
  const y = (p: number) => HAUT + ((max + marge - p) / (max - min + 2 * marge)) * (H - HAUT - BAS);

  const gauche = { debut: 16, fin: 300 };
  const droite = { debut: 330, fin: 464 };
  const pasCourt = (gauche.fin - gauche.debut) / scene.bougies.length;
  const pasLong = (droite.fin - droite.debut) / longues.length;

  const dessiner = (b: Bougie, cx: number, largeur: number, cle: string) => {
    const couleur = b.c >= b.o ? "var(--bull)" : "var(--bear)";
    return (
      <g key={cle} className="apparition">
        <line x1={cx} x2={cx} y1={y(b.h)} y2={y(b.l)} stroke={couleur} strokeWidth={1.5} />
        <rect x={cx - largeur / 2} y={y(Math.max(b.o, b.c))} width={largeur} height={Math.max(1.5, Math.abs(y(b.o) - y(b.c)))} rx={1} fill={couleur} />
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 480 ${H}`} role="img" aria-label={scene.description} className="h-auto w-full">
      <title>{scene.description}</title>
      <rect x={0} y={0} width={480} height={H} rx={12} fill="var(--chart)" />
      {scene.bougies.map((b, i) => dessiner(b, gauche.debut + pasCourt * (i + 0.5), pasCourt * 0.6, `c${i}`))}
      <text x={(gauche.debut + gauche.fin) / 2} y={H - 14} textAnchor="middle" fontSize={13} fill="var(--ink-2)">
        {scene.libelleCourt}
      </text>

      {etape >= 1
        ? longues.map((_, g) => {
            const x1 = gauche.debut + pasCourt * g * scene.groupe + 2;
            const x2 = gauche.debut + pasCourt * (g + 1) * scene.groupe - 2;
            return (
              <path
                key={`g${g}`}
                className="apparition"
                d={`M ${x1} ${H - 42} v 6 H ${x2} v -6`}
                fill="none"
                stroke="var(--brand)"
                strokeWidth={1.5}
              />
            );
          })
        : null}

      {etape >= 2 ? (
        <>
          <text x={315} y={y((min + max) / 2)} textAnchor="middle" fontSize={20} fill="var(--brand)">=</text>
          {longues.map((b, i) => dessiner(b, droite.debut + pasLong * (i + 0.5), Math.min(34, pasLong * 0.55), `l${i}`))}
          <text x={(droite.debut + droite.fin) / 2} y={H - 14} textAnchor="middle" fontSize={13} fill="var(--ink-2)">
            {scene.libelleLong}
          </text>
        </>
      ) : null}
    </svg>
  );
}
