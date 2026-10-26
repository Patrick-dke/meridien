"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

/** Terme cliquable dans un cours : la définition courte s'ouvre sur place, sans quitter la page. */
export function TermeGlossaire({
  slug,
  terme,
  court,
  children,
}: {
  slug: string;
  terme: string;
  court: string;
  children: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const panneau = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!ouvert) return;
    const placer = () => {
      const r = bouton.current?.getBoundingClientRect();
      if (!r) return;
      const largeur = Math.min(320, window.innerWidth - 16);
      const left = Math.min(Math.max(8, r.left), window.innerWidth - largeur - 8);
      const hauteur = panneau.current?.offsetHeight ?? 160;
      const top = r.bottom + 8 + hauteur > window.innerHeight ? Math.max(8, r.top - hauteur - 8) : r.bottom + 8;
      setPosition({ left, top });
    };
    placer();
    const fermerDehors = (e: PointerEvent) => {
      if (!panneau.current?.contains(e.target as Node) && !bouton.current?.contains(e.target as Node)) setOuvert(false);
    };
    const fermerEchap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvert(false);
        bouton.current?.focus();
      }
    };
    window.addEventListener("scroll", placer, true);
    window.addEventListener("resize", placer);
    document.addEventListener("pointerdown", fermerDehors);
    document.addEventListener("keydown", fermerEchap);
    return () => {
      window.removeEventListener("scroll", placer, true);
      window.removeEventListener("resize", placer);
      document.removeEventListener("pointerdown", fermerDehors);
      document.removeEventListener("keydown", fermerEchap);
    };
  }, [ouvert]);

  return (
    <>
      <button
        ref={bouton}
        type="button"
        aria-expanded={ouvert}
        aria-controls={id}
        onClick={() => setOuvert((o) => !o)}
        className="cursor-help rounded-sm text-inherit underline decoration-brand/70 decoration-dotted decoration-2 underline-offset-4 hover:decoration-brand"
      >
        {children}
      </button>
      {ouvert ? (
        <div
          ref={panneau}
          id={id}
          role="dialog"
          aria-label={`Définition : ${terme}`}
          style={{ left: position?.left ?? -9999, top: position?.top ?? -9999, width: "min(20rem, calc(100vw - 1rem))" }}
          className="apparition fixed z-50 rounded-xl border border-line-strong bg-overlay p-4 text-left text-sm leading-relaxed shadow-2xl shadow-black/50"
        >
          <p className="font-semibold text-ink">{terme}</p>
          <p className="mt-1 text-ink-2">{court}</p>
          <Link href={`/glossaire/${slug}/`} className="mt-2 inline-block text-sm font-medium text-brand hover:underline">
            Définition complète
          </Link>
        </div>
      ) : null}
    </>
  );
}
