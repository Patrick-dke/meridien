import { couleurCss, formatPrix, graduations } from "@/lib/chartkit/outils";
import type { Annotation, SceneBougies } from "@/lib/chartkit/types";

const L = 480;
const H = 280;
const GAUCHE = 8;
const DROITE = 64;
const HAUT = 16;
const BAS = 16;

/** Graphique en chandeliers annoté. `etape` révèle progressivement bougies et annotations. */
export function GraphiqueBougies({ scene, etape = Number.POSITIVE_INFINITY }: { scene: SceneBougies; etape?: number }) {
  const n = scene.bougies.length;
  const visibles = scene.revele
    ? (scene.revele[Math.min(etape, scene.revele.length - 1)] ?? n)
    : n;
  const annotations = scene.annotations.filter((a) => (a.etape ?? 0) <= etape);

  // L'échelle tient compte de toutes les bougies et annotations pour rester stable d'une étape à l'autre.
  const prix = [
    ...scene.bougies.flatMap((b) => [b.h, b.l]),
    ...scene.annotations.flatMap((a) =>
      a.type === "niveau" ? [a.prix] : a.type === "zone" ? [a.prixHaut, a.prixBas] : a.type === "fleche" ? [a.prix] : [],
    ),
  ];
  const brutMin = Math.min(...prix);
  const brutMax = Math.max(...prix);
  const marge = (brutMax - brutMin) * 0.08 || 1;
  const min = brutMin - marge;
  const max = brutMax + marge;

  const largeurTrace = L - GAUCHE - DROITE;
  const pas = largeurTrace / n;
  const x = (i: number) => GAUCHE + pas * (i + 0.5);
  const y = (p: number) => HAUT + ((max - p) / (max - min)) * (H - HAUT - BAS);
  const corps = Math.max(2, pas * 0.62);

  return (
    <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label={scene.description} className="h-auto w-full">
      <title>{scene.description}</title>
      <rect x={0} y={0} width={L} height={H} rx={12} fill="var(--chart)" />
      {graduations(min, max, 5).map((v) => (
        <g key={v}>
          <line x1={GAUCHE} x2={L - DROITE} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={1} />
          <text x={L - DROITE + 8} y={y(v) + 4.5} fontSize={13} fill="var(--ink-3)" className="font-mono tabular">
            {formatPrix(v, scene.decimales)}
          </text>
        </g>
      ))}

      {annotations
        .filter((a) => a.type === "zone")
        .map((a, i) => (
          <Zone key={`z${i}`} a={a} x={x} y={y} pas={pas} />
        ))}

      {scene.bougies.slice(0, visibles).map((b, i) => {
        const couleur = b.c >= b.o ? "var(--bull)" : "var(--bear)";
        const haut = y(Math.max(b.o, b.c));
        const hauteur = Math.max(1.5, Math.abs(y(b.o) - y(b.c)));
        return (
          <g key={i} className={scene.revele ? "apparition" : undefined}>
            <line x1={x(i)} x2={x(i)} y1={y(b.h)} y2={y(b.l)} stroke={couleur} strokeWidth={1.5} />
            <rect x={x(i) - corps / 2} y={haut} width={corps} height={hauteur} rx={1} fill={couleur} />
          </g>
        );
      })}

      {annotations
        .filter((a) => a.type !== "zone")
        .map((a, i) => (
          <Marque key={`a${i}`} a={a} x={x} y={y} pas={pas} decimales={scene.decimales} />
        ))}
    </svg>
  );
}

type Geometrie = { x: (i: number) => number; y: (p: number) => number; pas: number };

function Zone({ a, x, y, pas }: Geometrie & { a: Annotation }) {
  if (a.type !== "zone") return null;
  const x1 = a.de !== undefined ? x(a.de) - pas / 2 : GAUCHE;
  const x2 = a.a !== undefined ? x(a.a) + pas / 2 : L - DROITE;
  const c = couleurCss[a.couleur];
  return (
    <g className="apparition">
      <rect
        x={x1}
        y={y(a.prixHaut)}
        width={Math.max(2, x2 - x1)}
        height={Math.max(2, y(a.prixBas) - y(a.prixHaut))}
        fill={c}
        fillOpacity={0.16}
        stroke={c}
        strokeOpacity={0.55}
        strokeWidth={1}
      />
      {a.label ? (
        <text x={x1 + 6} y={y(a.prixHaut) + 16} fontSize={13} fontWeight={600} fill={c}>
          {a.label}
        </text>
      ) : null}
    </g>
  );
}

function Marque({ a, x, y, pas, decimales }: Geometrie & { a: Annotation; decimales: number }) {
  if (a.type === "niveau") {
    const c = couleurCss[a.couleur];
    const x1 = a.de !== undefined ? x(a.de) - pas / 2 : GAUCHE;
    const x2 = a.a !== undefined ? x(a.a) + pas / 2 : L - DROITE;
    const texte = a.label ? `${a.label} · ${formatPrix(a.prix, decimales)}` : formatPrix(a.prix, decimales);
    const largeurTexte = texte.length * 7.2 + 12;
    return (
      <g className="apparition">
        <line
          x1={x1}
          x2={x2}
          y1={y(a.prix)}
          y2={y(a.prix)}
          stroke={c}
          strokeWidth={1.75}
          strokeDasharray={a.style === "pointille" ? "6 5" : undefined}
        />
        <rect x={x2 - largeurTexte} y={y(a.prix) - 21} width={largeurTexte} height={18} rx={4} fill="var(--overlay)" />
        <text x={x2 - 6} y={y(a.prix) - 8} textAnchor="end" fontSize={12.5} fontWeight={600} fill={c} className="tabular">
          {texte}
        </text>
      </g>
    );
  }
  if (a.type === "fleche") {
    const c = couleurCss[a.couleur];
    const cx = x(a.index);
    const cy = y(a.prix);
    const d = a.sens === "haut" ? 1 : -1;
    // La pointe touche le prix ; le corps de la flèche s'éloigne du prix.
    const pointe = `M ${cx} ${cy} l -7 ${10 * d} l 14 0 Z`;
    return (
      <g className="apparition">
        <path d={pointe} fill={c} />
        <line x1={cx} x2={cx} y1={cy + 10 * d} y2={cy + 26 * d} stroke={c} strokeWidth={2.5} />
        {a.label ? (
          <text x={cx} y={cy + (d > 0 ? 42 : -32)} textAnchor="middle" fontSize={13} fontWeight={600} fill={c}>
            {a.label}
          </text>
        ) : null}
      </g>
    );
  }
  if (a.type === "repere") {
    const c = couleurCss[a.couleur];
    return (
      <g className="apparition">
        <rect
          x={x(a.index) - pas / 2 + 1}
          y={HAUT - 6}
          width={pas - 2}
          height={H - HAUT - BAS + 12}
          rx={6}
          fill={c}
          fillOpacity={0.08}
          stroke={c}
          strokeOpacity={0.6}
          strokeDasharray="4 4"
        />
        {a.label ? (
          <text x={x(a.index)} y={H - 4} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={c}>
            {a.label}
          </text>
        ) : null}
      </g>
    );
  }
  return null;
}
