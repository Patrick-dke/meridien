/** Logo Méridien : un méridien qui traverse une bougie. */
export function Logo({ avecNom = true }: { avecNom?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="var(--brand-solid)" />
        <path d="M16 4c-6 4-6 20 0 24" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.5" />
        <path d="M16 4c6 4 6 20 0 24" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.5" />
        <line x1="16" y1="8" x2="16" y2="24" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <rect x="13" y="12" width="6" height="8" rx="1.5" fill="#fff" />
      </svg>
      {avecNom ? <span className="text-[1.05rem] font-semibold tracking-tight text-ink">Méridien</span> : null}
    </span>
  );
}
