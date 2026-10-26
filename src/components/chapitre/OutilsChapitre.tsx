"use client";

import { useEffect, useRef, useState } from "react";
import { basculerFavori, ecrireNote, useProgression } from "@/lib/progression/store";
import { IconeEtoile, IconeNote } from "../ui/Icones";

/** Favori et notes personnelles d'un chapitre, enregistrés dans le navigateur. */
export function OutilsChapitre({ slug }: { slug: string }) {
  const p = useProgression();
  const favori = p.favoris.includes(slug);
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const charge = useRef(false);
  const delai = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!ouvert || charge.current) return;
    charge.current = true;
    setTexte(p.notes[slug] ?? "");
  }, [ouvert, p.notes, slug]);

  const modifier = (v: string) => {
    setTexte(v);
    window.clearTimeout(delai.current);
    delai.current = window.setTimeout(() => ecrireNote(slug, v), 500);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => basculerFavori(slug)}
          aria-pressed={favori}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${favori ? "border-gold/60 text-gold" : "border-line text-ink-2 hover:text-ink"}`}
        >
          <IconeEtoile pleine={favori} className="size-4" />
          {favori ? "Dans mes favoris" : "Ajouter aux favoris"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          aria-expanded={ouvert}
          aria-controls={`notes-${slug}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-ink-2 hover:text-ink"
        >
          <IconeNote className="size-4" />
          Mes notes{p.notes[slug] ? " (1)" : ""}
        </button>
      </div>
      {ouvert ? (
        <div id={`notes-${slug}`} className="mt-3">
          <label htmlFor={`zone-notes-${slug}`} className="sr-only">
            Mes notes sur ce chapitre
          </label>
          <textarea
            id={`zone-notes-${slug}`}
            value={texte}
            onChange={(e) => modifier(e.target.value)}
            rows={5}
            placeholder="Tes notes restent dans ce navigateur. Elles sont incluses dans l'export de tes données."
            className="w-full rounded-xl border border-line-strong bg-bg p-3 text-[0.95rem] text-ink outline-none focus:border-brand"
          />
          <p className="mt-1 text-xs text-ink-3">Enregistrement automatique.</p>
        </div>
      ) : null}
    </div>
  );
}
