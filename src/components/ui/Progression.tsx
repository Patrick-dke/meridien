/** Jauges du méridien : un trait safran sur un fond de filet. L'anneau suit sa valeur par une courte transition. */
export function Anneau({
  valeur,
  taille = 56,
  epaisseur = 5,
  libelle,
  children,
  teinte,
}: {
  /** De 0 à 1. */
  valeur: number;
  taille?: number;
  epaisseur?: number;
  libelle: string;
  children?: React.ReactNode;
  /** Couleur du tracé, safran par défaut. */
  teinte?: string;
}) {
  const v = Math.max(0, Math.min(1, valeur));
  const r = (taille - epaisseur) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: taille, height: taille }}
      role="img"
      aria-label={`${libelle} : ${Math.round(v * 100)} %`}
    >
      <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`} className="-rotate-90" aria-hidden="true">
        <circle cx={taille / 2} cy={taille / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={epaisseur} />
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={r}
          fill="none"
          stroke={teinte ?? "var(--jauge)"}
          strokeWidth={epaisseur}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - v)}
          style={{ transition: "stroke-dashoffset 400ms var(--ease-out-soft)" }}
        />
      </svg>
      {children ? <span className="absolute inset-0 flex items-center justify-center">{children}</span> : null}
    </span>
  );
}

/** Barre de progression horizontale, accessible. */
export function Jauge({ valeur, libelle, className = "" }: { valeur: number; libelle: string; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, valeur)) * 100);
  return (
    <div className={`jauge ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={libelle}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Niveau de 1 à 5 en barrettes, doublé d'un texte pour les lecteurs d'écran. */
export function Niveau({ niveau, className = "" }: { niveau: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-end gap-[3px]" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`w-[4px] ${n <= niveau ? "bg-ink" : "bg-line-strong"}`} style={{ height: 5 + n * 2 }} />
        ))}
      </span>
      <span className="text-xs text-ink-3">Niveau {niveau}</span>
    </span>
  );
}

/** Ancienne référence #degrade-meridien (figures de capsules) : un aplat safran, plus de dégradé. */
export function DefinitionsDegrades() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="degrade-meridien">
          <stop offset="0%" stopColor="var(--jauge)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
