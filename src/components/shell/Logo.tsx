/**
 * Logo Méridien : un méridien lumineux (iris → cyan) qui traverse une bougie. Le dégradé vient des définitions
 * communes de la page (#degrade-meridien) : un dégradé défini dans un logo masqué (barre latérale sur mobile)
 * ne s'afficherait pas ailleurs.
 */
export function Logo({ avecNom = true }: { avecNom?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#121827" stroke="url(#degrade-meridien)" strokeOpacity="0.6" />
        <path d="M16 4.5c-6.2 4-6.2 19 0 23" fill="none" stroke="url(#degrade-meridien)" strokeOpacity="0.75" strokeWidth="1.4" />
        <path d="M16 4.5c6.2 4 6.2 19 0 23" fill="none" stroke="url(#degrade-meridien)" strokeOpacity="0.75" strokeWidth="1.4" />
        <line x1="16" y1="8" x2="16" y2="24" stroke="#eef1f8" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="13" y="12" width="6" height="8" rx="1.5" fill="url(#degrade-meridien)" />
      </svg>
      {avecNom ? <span className="font-[family-name:var(--font-display)] text-[1.05rem] font-semibold tracking-tight text-ink">Méridien</span> : null}
    </span>
  );
}
