const tons = {
  brand: "border-brand/40 bg-brand-soft text-brand",
  cyan: "border-cyan/35 bg-cyan/10 text-cyan",
  ok: "border-ok/40 bg-ok/10 text-ok",
  warn: "border-warn/40 bg-warn/10 text-warn",
  gold: "border-gold/40 bg-gold/10 text-gold",
  neutre: "border-line-strong bg-surface-2/70 text-ink-2",
} as const;

export type Ton = keyof typeof tons;

/** Petite étiquette : statut, durée, marché, niveau. */
export function Puce({ ton = "neutre", children, className = "" }: { ton?: Ton; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tons[ton]} ${className}`}>
      {children}
    </span>
  );
}
