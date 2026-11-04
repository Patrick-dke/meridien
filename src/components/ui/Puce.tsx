const tons = {
  brand: "border-brand/35 text-brand",
  cyan: "border-cyan/40 text-cyan",
  ok: "border-ok/40 text-ok",
  warn: "border-warn/45 text-warn",
  gold: "border-gold/45 text-gold",
  neutre: "border-line-strong text-ink-2",
} as const;

export type Ton = keyof typeof tons;

/** Petite étiquette : statut, durée, marché, niveau. Un cadre fin, comme une mention en marge. */
export function Puce({ ton = "neutre", children, className = "" }: { ton?: Ton; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-[3px] border bg-surface px-2 py-0.5 text-xs font-medium ${tons[ton]} ${className}`}>
      {children}
    </span>
  );
}
