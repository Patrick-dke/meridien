import type { Motif } from "@/content/identite";
import { aleatoire } from "@/lib/chartkit/outils";

const L = 320;
const H = 180;

/** Graine stable à partir d'un texte (FNV-1a) : une même carte a toujours le même dessin. */
function graineDe(texte: string) {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Une petite série de bougies (marche aléatoire) cadrée dans un rectangle. */
function bougies(alea: () => number, n: number, x0: number, x1: number, y0: number, y1: number, derive = 0) {
  let p = 0;
  const brut = Array.from({ length: n }, () => {
    const o = p;
    p += (alea() - 0.5 + derive) * 2;
    const c = p;
    const h = Math.max(o, c) + alea() * 0.9;
    const l = Math.min(o, c) - alea() * 0.9;
    return { o, c, h, l };
  });
  const min = Math.min(...brut.map((b) => b.l));
  const max = Math.max(...brut.map((b) => b.h));
  const y = (v: number) => y1 - ((v - min) / (max - min || 1)) * (y1 - y0);
  const pas = (x1 - x0) / n;
  return brut.map((b, i) => ({ x: x0 + pas * (i + 0.5), largeur: pas * 0.56, ...b, yo: y(b.o), yc: y(b.c), yh: y(b.h), yl: y(b.l) }));
}

/** Les bougies d'une vignette en quatre tracés (mèches et corps, hausse et baisse) : peu d'éléments à dessiner. */
function Bougies({ liste }: { liste: ReturnType<typeof bougies> }) {
  const f = (v: number) => v.toFixed(1);
  const t = { meches: { h: "", b: "" }, corps: { h: "", b: "" } };
  for (const b of liste) {
    const k = b.c >= b.o ? "h" : "b";
    const haut = Math.min(b.yo, b.yc);
    const hauteur = Math.max(1.5, Math.abs(b.yo - b.yc));
    t.meches[k] += `M${f(b.x)} ${f(b.yh)}V${f(b.yl)}`;
    t.corps[k] += `M${f(b.x - b.largeur / 2)} ${f(haut)}h${f(b.largeur)}v${f(hauteur)}h${f(-b.largeur)}Z`;
  }
  return (
    <g opacity={0.9}>
      <path d={t.meches.h} stroke="var(--bull)" strokeWidth={1.4} fill="none" />
      <path d={t.meches.b} stroke="var(--bear)" strokeWidth={1.4} fill="none" />
      <path d={t.corps.h} fill="var(--bull)" />
      <path d={t.corps.b} fill="var(--bear)" />
    </g>
  );
}

function courbe(alea: () => number, n: number, y0: number, y1: number, derive = 0) {
  let v = 0;
  const pts = Array.from({ length: n }, () => (v += (alea() - 0.5 + derive) * 2));
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  return pts.map((p, i) => [24 + (i / (n - 1)) * (L - 48), y1 - ((p - min) / (max - min || 1)) * (y1 - y0)] as const);
}
const chemin = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

function Dessin({ motif, teinte, graine }: { motif: Motif; teinte: string; graine: number }) {
  // Le générateur naît ici : un rendu répété (mode strict) redonne exactement le même dessin.
  const alea = aleatoire(graine);
  switch (motif) {
    case "globe":
      return (
        <g fill="none" stroke={teinte} strokeOpacity={0.75}>
          <circle cx={118} cy={92} r={58} strokeWidth={1.4} />
          {[16, 34, 50].map((rx) => (
            <ellipse key={rx} cx={118} cy={92} rx={rx} ry={58} strokeWidth={1} strokeOpacity={0.45} />
          ))}
          {[-30, 0, 30].map((dy) => (
            <line key={dy} x1={118 - Math.sqrt(58 ** 2 - dy ** 2)} x2={118 + Math.sqrt(58 ** 2 - dy ** 2)} y1={92 + dy} y2={92 + dy} strokeWidth={1} strokeOpacity={0.35} />
          ))}
          <path d={chemin(courbe(alea, 14, 60, 120, 0.12).map(([x, y]) => [x * 0.42 + 176, y] as const))} stroke="var(--cyan)" strokeWidth={2} />
        </g>
      );
    case "marches":
      return (
        <g fill="none" strokeWidth={1.8}>
          {[0.35, 0.6].map((o, i) => (
            <path key={i} d={chemin(courbe(alea, 22, 40, 150))} stroke={teinte} strokeOpacity={o} />
          ))}
          <path d={chemin(courbe(alea, 22, 36, 146, 0.1))} stroke="var(--cyan)" strokeWidth={2.2} />
        </g>
      );
    case "bougies":
      return <Bougies liste={bougies(alea, 13, 30, 290, 34, 152, 0.05)} />;
    case "tendance": {
      const liste = bougies(alea, 14, 30, 290, 30, 150, 0.32);
      const premier = liste[0];
      const dernier = liste.at(-1)!;
      return (
        <g>
          <Bougies liste={liste} />
          <line x1={premier.x} y1={premier.yl + 6} x2={dernier.x} y2={Math.min(dernier.yl, liste.at(-2)!.yl) + 8} stroke={teinte} strokeWidth={2} strokeDasharray="6 5" />
        </g>
      );
    }
    case "risque":
      return (
        <g>
          {Array.from({ length: 15 }, (_, i) => {
            // Arrondi : le serveur et le navigateur ne calculent pas exp() au dernier chiffre près.
            const h = Math.round(Math.exp(-(((i - 7) / 3.2) ** 2)) * 1100 + 60) / 10;
            return <rect key={i} x={40 + i * 16} y={156 - h} width={11} height={h} rx={2} fill={i < 4 ? "var(--bear)" : teinte} fillOpacity={i < 4 ? 0.8 : 0.55} />;
          })}
          <line x1={100} x2={100} y1={26} y2={160} stroke="var(--gold)" strokeWidth={1.6} strokeDasharray="5 4" />
        </g>
      );
    case "onde":
      return (
        <g fill="none">
          {[0, 1, 2].map((k) => (
            <path
              key={k}
              d={chemin(Array.from({ length: 40 }, (_, i) => [24 + i * 7, 92 + Math.sin(i / (3 + k) + k) * (34 - k * 9)] as const))}
              stroke={k === 0 ? "var(--cyan)" : teinte}
              strokeOpacity={1 - k * 0.3}
              strokeWidth={2 - k * 0.4}
            />
          ))}
        </g>
      );
    case "bouclier":
      return (
        <g fill="none" stroke={teinte} strokeWidth={2}>
          <path d="M160 30 L212 48 V96 C212 130 188 148 160 160 C132 148 108 130 108 96 V48 Z" strokeOpacity={0.85} />
          <path d="M138 96 L154 112 L184 80" stroke="var(--cyan)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "meche": {
      const liste = bougies(alea, 9, 30, 210, 60, 150, -0.1);
      return (
        <g>
          <Bougies liste={liste} />
          <line x1={252} x2={252} y1={44} y2={160} stroke="var(--bull)" strokeWidth={2} />
          <rect x={243} y={46} width={18} height={16} rx={2} fill="var(--bull)" />
          <circle cx={252} cy={152} r={10} fill="none" stroke={teinte} strokeWidth={1.6} />
        </g>
      );
    }
    case "structure": {
      const pts = [
        [30, 140],
        [80, 92],
        [112, 118],
        [170, 62],
        [204, 96],
        [262, 38],
        [292, 58],
      ] as const;
      return (
        <g>
          <rect x={150} y={70} width={120} height={22} fill={teinte} fillOpacity={0.16} stroke={teinte} strokeOpacity={0.5} />
          <path d={chemin(pts)} fill="none" stroke="var(--cyan)" strokeWidth={2.2} strokeLinejoin="round" />
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3.2} fill={i % 2 ? teinte : "var(--ink-3)"} />
          ))}
        </g>
      );
    }
    case "liquidite":
      return (
        <g>
          <line x1={30} x2={290} y1={64} y2={64} stroke={teinte} strokeWidth={1.6} strokeDasharray="6 5" />
          <Bougies liste={bougies(alea, 12, 30, 250, 66, 150, 0)} />
          <line x1={270} x2={270} y1={40} y2={120} stroke="var(--bear)" strokeWidth={2} />
          <rect x={262} y={74} width={16} height={36} rx={2} fill="var(--bear)" />
          <path d="M270 30 l-6 9 h12 z" fill="var(--gold)" />
        </g>
      );
    case "modeles":
      return (
        <g>
          {[
            [70, 90],
            [160, 50],
            [160, 130],
            [250, 90],
          ].map(([x, y], i, t) => (
            <g key={i}>
              {i > 0 ? <line x1={i === 3 ? t[1][0] : t[0][0]} y1={i === 3 ? t[1][1] : t[0][1]} x2={x} y2={y} stroke={teinte} strokeOpacity={0.5} strokeWidth={1.5} /> : null}
              {i === 3 ? <line x1={t[2][0]} y1={t[2][1]} x2={x} y2={y} stroke={teinte} strokeOpacity={0.5} strokeWidth={1.5} /> : null}
              <circle cx={x} cy={y} r={14} fill="var(--surface-2)" stroke={i === 3 ? "var(--cyan)" : teinte} strokeWidth={2} />
            </g>
          ))}
        </g>
      );
    case "methode":
      return (
        <g>
          {Array.from({ length: 28 }, (_, i) => {
            const x = 34 + alea() * 252;
            const y = 150 - (x - 34) * 0.36 - alea() * 46;
            return <circle key={i} cx={x} cy={y} r={2.6} fill={teinte} fillOpacity={0.7} />;
          })}
          <line x1={34} y1={140} x2={286} y2={50} stroke="var(--cyan)" strokeWidth={2} />
        </g>
      );
  }
}

/**
 * Vignette générée pour une académie, un module ou un chapitre : fond nocturne, lueur de la teinte de
 * l'académie et un motif qui évoque le thème. Purement décorative (le titre de la carte suffit).
 */
export function Vignette({ motif, teinte, graine, className = "" }: { motif: Motif; teinte: string; graine: string; className?: string }) {
  const n = graineDe(graine);
  const id = `v${n.toString(36)}`;
  return (
    <svg viewBox={`0 0 ${L} ${H}`} className={`h-auto w-full ${className}`} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={id} cx="85%" cy="0%" r="90%">
          <stop offset="0%" stopColor={teinte} stopOpacity={0.32} />
          <stop offset="100%" stopColor={teinte} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={L} height={H} fill="var(--chart)" />
      <rect width={L} height={H} fill={`url(#${id})`} />
      {[45, 90, 135].map((y) => (
        <line key={y} x1={0} x2={L} y1={y} y2={y} stroke="var(--line)" strokeWidth={1} />
      ))}
      <Dessin motif={motif} teinte={teinte} graine={n} />
    </svg>
  );
}
