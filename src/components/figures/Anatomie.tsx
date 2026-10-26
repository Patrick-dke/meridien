/** Anatomie d'une bougie haussière et d'une bougie baissière. */
export function Anatomie({ description, etape = Number.POSITIVE_INFINITY }: { description: string; etape?: number }) {
  const texte = { fontSize: 13.5, fill: "var(--ink-2)" } as const;
  const repere = { stroke: "var(--line-strong)", strokeWidth: 1, strokeDasharray: "3 3" } as const;
  return (
    <svg viewBox="0 0 480 290" role="img" aria-label={description} className="h-auto w-full">
      <title>{description}</title>
      <rect x={0} y={0} width={480} height={290} rx={12} fill="var(--chart)" />

      {/* Bougie haussière */}
      <g className="apparition">
        <line x1={150} x2={150} y1={36} y2={232} stroke="var(--bull)" strokeWidth={3} />
        <rect x={126} y={86} width={48} height={96} rx={2} fill="var(--bull)" />
        <text x={150} y={270} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--bull)">
          Haussière
        </text>
      </g>
      {etape >= 1 ? (
        <g className="apparition">
          <line x1={64} x2={150} y1={36} y2={36} {...repere} />
          <line x1={64} x2={126} y1={86} y2={86} {...repere} />
          <line x1={64} x2={126} y1={182} y2={182} {...repere} />
          <line x1={64} x2={150} y1={232} y2={232} {...repere} />
          <text x={60} y={40} textAnchor="end" {...texte}>Plus haut</text>
          <text x={60} y={90} textAnchor="end" {...texte}>Clôture</text>
          <text x={60} y={186} textAnchor="end" {...texte}>Ouverture</text>
          <text x={60} y={236} textAnchor="end" {...texte}>Plus bas</text>
        </g>
      ) : null}
      {etape >= 2 ? (
        <g className="apparition">
          <text x={240} y={66} textAnchor="middle" fontSize={13.5} fontWeight={600} fill="var(--ink)">Mèche haute</text>
          <text x={240} y={138} textAnchor="middle" fontSize={13.5} fontWeight={600} fill="var(--ink)">Corps</text>
          <text x={240} y={212} textAnchor="middle" fontSize={13.5} fontWeight={600} fill="var(--ink)">Mèche basse</text>
          <line x1={196} x2={156} y1={62} y2={62} stroke="var(--ink-3)" />
          <line x1={212} x2={178} y1={134} y2={134} stroke="var(--ink-3)" />
          <line x1={196} x2={156} y1={208} y2={208} stroke="var(--ink-3)" />
        </g>
      ) : null}

      {/* Bougie baissière */}
      {etape >= 3 ? (
        <g className="apparition">
          <line x1={330} x2={330} y1={46} y2={242} stroke="var(--bear)" strokeWidth={3} />
          <rect x={306} y={96} width={48} height={96} rx={2} fill="var(--bear)" />
          <text x={330} y={270} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--bear)">
            Baissière
          </text>
          <line x1={330} x2={410} y1={46} y2={46} {...repere} />
          <line x1={354} x2={410} y1={96} y2={96} {...repere} />
          <line x1={354} x2={410} y1={192} y2={192} {...repere} />
          <line x1={330} x2={410} y1={242} y2={242} {...repere} />
          <text x={414} y={50} {...texte}>Plus haut</text>
          <text x={414} y={100} {...texte}>Ouverture</text>
          <text x={414} y={196} {...texte}>Clôture</text>
          <text x={414} y={246} {...texte}>Plus bas</text>
        </g>
      ) : null}
    </svg>
  );
}
