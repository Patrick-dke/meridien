/**
 * Logo Méridien : un carré d'encre traversé par le méridien, qui sert aussi de mèche à une bougie safran. Les
 * couleurs suivent le thème (encre et papier s'inversent en sombre), le safran reste.
 */
export function Logo({ avecNom = true }: { avecNom?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect width="32" height="32" rx="5" fill="var(--brand-solid)" />
        <line x1="16" y1="5" x2="16" y2="27" stroke="var(--on-solid)" strokeWidth="1.6" />
        <rect x="11.5" y="11" width="9" height="10" fill="var(--accent)" />
      </svg>
      {avecNom ? <span className="font-[family-name:var(--font-display)] text-[1.3rem] font-semibold leading-none tracking-[-0.01em] text-ink">Méridien</span> : null}
    </span>
  );
}
