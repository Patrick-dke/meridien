"use client";

import { useRef, useState } from "react";
import { IconeSuivant } from "../ui/Icones";

/**
 * Le cours se dévoile notion par notion : on lit, puis on passe à la suivante. Toutes les notions restent dans
 * la page (masquées), et « Tout afficher » les ouvre d'un coup pour qui préfère lire d'une traite.
 */
export function CoursProgressif({ titres, children }: { titres: string[]; children: React.ReactNode[] }) {
  const [ouvertes, setOuvertes] = useState(1);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const total = titres.length;

  const suivante = () => {
    const n = Math.min(total, ouvertes + 1);
    setOuvertes(n);
    requestAnimationFrame(() => {
      const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
      refs.current[n - 1]?.scrollIntoView({ block: "start", behavior: reduit ? "auto" : "smooth" });
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <ol className="flex flex-wrap gap-1.5" aria-label="Notions du cours">
          {titres.map((t, i) => (
            <li key={t}>
              <span
                className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors duration-300 ${
                  i < ouvertes ? "border-brand/40 bg-brand-soft text-ink" : "border-line text-ink-3"
                }`}
              >
                <span className="font-mono">{i + 1}</span>
                <span className="max-w-[14rem] truncate">{t}</span>
              </span>
            </li>
          ))}
        </ol>
        {ouvertes < total ? (
          <button type="button" onClick={() => setOuvertes(total)} className="btn btn-discret !min-h-9 text-sm">
            Tout afficher
          </button>
        ) : null}
      </div>
      <div className="space-y-12">
        {children.map((enfant, i) => (
          <div
            key={titres[i]}
            ref={(el) => {
              refs.current[i] = el;
            }}
            hidden={i >= ouvertes}
            className={`scroll-mt-44 ${i > 0 ? "apparition" : ""}`}
          >
            {enfant}
          </div>
        ))}
      </div>
      {ouvertes < total ? (
        <div className="mt-10 flex flex-col items-start gap-2 rounded-2xl border border-dashed border-line-strong p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-2">
            Notion {ouvertes} sur {total} lue. Prochaine : <span className="font-medium text-ink">{titres[ouvertes]}</span>
          </p>
          <button type="button" onClick={suivante} className="btn btn-secondaire">
            Notion suivante
            <IconeSuivant className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
