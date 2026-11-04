import type { CategorieOutil } from "@/lib/outils/catalogue";

/**
 * Illustrations des outils : un graphique avec ses tracés d'indicateur, ou un terminal où le robot tourne sous
 * licence. Schématiques par choix : aucun chiffre de gain, aucune courbe de résultats.
 */

// Série fixe, construite pour l'illustration (pas de hasard au rendu : même image côté serveur et navigateur).
const PRIX = [52, 50, 53, 57, 55, 59, 63, 61, 58, 60, 64, 68, 66, 70, 73, 71, 67, 65, 68, 72, 76, 74, 78, 81];

function Chandeliers({ largeur, hauteur, decalage = 0 }: { largeur: number; hauteur: number; decalage?: number }) {
  const pas = largeur / PRIX.length;
  const y = (p: number) => hauteur - ((p - 44) / 44) * hauteur;
  return (
    <g>
      {PRIX.map((c, i) => {
        const o = i ? PRIX[i - 1] : c - 2;
        const h = Math.max(o, c) + 2 + (i % 3);
        const l = Math.min(o, c) - 2 - ((i + 1) % 2);
        const hausse = c >= o;
        const x = decalage + pas * (i + 0.5);
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={y(h)} y2={y(l)} stroke={hausse ? "var(--bull)" : "var(--bear)"} strokeWidth={1.2} />
            <rect x={x - pas * 0.3} y={y(Math.max(o, c))} width={pas * 0.6} height={Math.max(1, Math.abs(y(o) - y(c)))} fill={hausse ? "var(--bull)" : "var(--bear)"} />
          </g>
        );
      })}
    </g>
  );
}

function Indicateur() {
  const L = 320;
  const H = 150;
  const pas = L / PRIX.length;
  const y = (p: number) => H - ((p - 44) / 44) * H;
  // Moyenne glissante sur 5 bougies : un tracé lisse, comme le dessinerait l'indicateur.
  const moyenne = PRIX.map((_, i) => {
    const t = PRIX.slice(Math.max(0, i - 4), i + 1);
    return t.reduce((a, b) => a + b, 0) / t.length;
  });
  return (
    <svg viewBox={`0 0 ${L + 40} ${H + 46}`} className="block w-full" aria-hidden="true">
      <rect width={L + 40} height={H + 46} fill="var(--chart)" />
      <rect width={L + 40} height="22" fill="var(--surface-2)" />
      <circle cx="12" cy="11" r="3.5" fill="var(--line-strong)" />
      <text x="24" y="15" fontSize="10" fill="var(--ink-2)" className="font-mono">
        Indicateur Méridien · TradingView
      </text>
      <g transform="translate(6 34)">
        {[0.25, 0.5, 0.75].map((k) => (
          <line key={k} x1="0" x2={L} y1={H * k} y2={H * k} stroke="var(--line)" />
        ))}
        {/* Zones repérées par l'indicateur : simples cadres translucides. */}
        <rect x={pas * 7} y={y(63)} width={pas * 6} height={y(57) - y(63)} fill="var(--fvg)" fillOpacity="0.14" stroke="var(--fvg)" strokeOpacity="0.5" />
        <rect x={pas * 16} y={y(68)} width={pas * 7} height={y(64) - y(68)} fill="var(--ob)" fillOpacity="0.14" stroke="var(--ob)" strokeOpacity="0.5" />
        <Chandeliers largeur={L} hauteur={H} />
        <polyline
          points={moyenne.map((m, i) => `${pas * (i + 0.5)},${y(m)}`).join(" ")}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.8"
          className="trace-defile"
          style={{ ["--longueur" as string]: 520 }}
        />
        <path d={`M${pas * 13.5} ${y(73) - 10} l-4 -7 h8 z`} fill="var(--ink)" />
      </g>
    </svg>
  );
}

function Robot() {
  return (
    <svg viewBox="0 0 360 196" className="block w-full" aria-hidden="true">
      <rect width="360" height="196" fill="var(--chart)" />
      <rect width="360" height="22" fill="var(--surface-2)" />
      <text x="10" y="15" fontSize="10" fill="var(--ink-2)" className="font-mono">
        MetaTrader 5 · EURUSD, H1
      </text>
      <g transform="translate(6 34)" opacity="0.55">
        <Chandeliers largeur={348} hauteur={150} />
      </g>
      {/* Panneau du robot : état de la licence et du compte, jamais de résultat. */}
      <g transform="translate(176 46)">
        <rect width="166" height="104" fill="var(--surface)" stroke="var(--line-strong)" />
        <rect width="166" height="20" fill="var(--brand-solid)" />
        <text x="9" y="14" fontSize="10" fontWeight="600" fill="var(--on-solid)" className="font-mono">
          EA Méridien
        </text>
        {[
          ["Licence", "active"],
          ["Compte", "autorisé"],
          ["Mode", "démonstration"],
          ["Risque", "fixé par toi"],
        ].map(([k, v], i) => (
          <g key={k} transform={`translate(9 ${36 + i * 18})`} fontSize="9.5" className="font-mono">
            <text fill="var(--ink-3)">{k}</text>
            <text x="148" textAnchor="end" fill="var(--ink)">
              {v}
            </text>
          </g>
        ))}
        <circle cx="152" cy="10" r="3.5" fill="var(--ok)" />
      </g>
    </svg>
  );
}

export function IllustrationOutil({ categorie }: { categorie: CategorieOutil }) {
  return categorie === "indicateur" ? <Indicateur /> : <Robot />;
}
