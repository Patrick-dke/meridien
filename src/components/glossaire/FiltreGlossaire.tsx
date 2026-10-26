"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const normaliser = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

type Entree = { slug: string; terme: string; court: string; synonymes: string[] };

/** Liste du glossaire, triée par ordre alphabétique et filtrable (accents ignorés). */
export function FiltreGlossaire({ termes }: { termes: Entree[] }) {
  const [filtre, setFiltre] = useState("");
  const visibles = useMemo(() => {
    const f = normaliser(filtre.trim());
    if (!f) return termes;
    return termes.filter((t) => normaliser([t.terme, ...t.synonymes, t.court].join(" ")).includes(f));
  }, [filtre, termes]);

  return (
    <div>
      <label htmlFor="filtre-glossaire" className="sr-only">
        Filtrer le glossaire
      </label>
      <input
        id="filtre-glossaire"
        type="search"
        value={filtre}
        onChange={(e) => setFiltre(e.target.value)}
        placeholder="Filtrer : spread, levier, bougie…"
        className="w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-ink outline-none placeholder:text-ink-3 focus:border-brand"
      />
      <p className="mt-2 text-sm text-ink-3" aria-live="polite">
        {visibles.length} terme{visibles.length > 1 ? "s" : ""}
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {visibles.map((t) => (
          <li key={t.slug}>
            <Link href={`/glossaire/${t.slug}/`} className="block h-full rounded-xl border border-line bg-surface p-4 transition-colors hover:border-brand/60">
              <span className="font-semibold text-ink">{t.terme}</span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-2">{t.court}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
