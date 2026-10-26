/**
 * Jauges du méridien. Le dégradé iris → cyan est défini une seule fois dans la mise en page (#degrade-meridien).
 * L'anneau se remplit au premier affichage (animation CSS) puis suit la valeur (transition).
 */
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
  /** Couleur unie à la place du dégradé (par exemple l'or de la maîtrise). */
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
          stroke={teinte ?? "url(#degrade-meridien)"}
          strokeWidth={epaisseur}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - v)}
          className="anneau-trace"
          style={{ ["--circ" as string]: circ, transition: "stroke-dashoffset 900ms var(--ease-out-soft)" }}
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
          <span key={n} className={`w-[4px] rounded-full ${n <= niveau ? "bg-brand" : "bg-line-strong"}`} style={{ height: 5 + n * 2 }} />
        ))}
      </span>
      <span className="text-xs text-ink-3">Niveau {niveau}</span>
    </span>
  );
}

/** Dégradés partagés par toutes les jauges : à placer une fois dans la page. */
export function DefinitionsDegrades() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="degrade-meridien" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--cyan)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
