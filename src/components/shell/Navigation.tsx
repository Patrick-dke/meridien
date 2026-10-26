"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgression } from "@/lib/progression/store";
import { Jauge } from "../ui/Progression";
import { IconeAccueil, IconeGlossaire, IconeLivre, IconeOutils, IconeProfil } from "../ui/Icones";
import { Logo } from "./Logo";

const liens = [
  { href: "/", libelle: "Accueil", Icone: IconeAccueil, actif: (p: string) => p === "/" },
  {
    href: "/academies/",
    libelle: "Apprendre",
    Icone: IconeLivre,
    actif: (p: string) => p.startsWith("/academies") || p.startsWith("/chapitre") || p.startsWith("/parcours") || p.startsWith("/commencer"),
  },
  { href: "/outils/", libelle: "Outils", Icone: IconeOutils, actif: (p: string) => p.startsWith("/outils") },
  { href: "/glossaire/", libelle: "Glossaire", Icone: IconeGlossaire, actif: (p: string) => p.startsWith("/glossaire") },
  { href: "/tableau-de-bord/", libelle: "Moi", Icone: IconeProfil, actif: (p: string) => p.startsWith("/tableau-de-bord") || p.startsWith("/parametres") },
];

/** Reprise rapide : le chapitre en cours et son avancement, sous la navigation. */
function Reprise({ titres, etapes }: { titres: Record<string, string>; etapes: Record<string, number> }) {
  const p = useProgression();
  const slug = p.dernierChapitre;
  const c = slug ? p.chapitres[slug] : undefined;
  if (!slug || !c || !titres[slug]) return null;
  const total = etapes[slug] ?? 10;
  const avance = c.statut === "termine" ? 1 : Math.min(1, (c.etape + 1) / total);
  return (
    <Link href={`/chapitre/${slug}/`} className="carte carte-vive mb-4 block p-3.5">
      <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-cyan">{c.statut === "termine" ? "Dernier chapitre" : "Reprendre"}</span>
      <span className="mt-1 line-clamp-2 block text-sm font-medium leading-snug text-ink">{titres[slug]}</span>
      <Jauge valeur={avance} libelle="Avancement du chapitre" className="mt-2.5 !h-1.5" />
    </Link>
  );
}

/** Barre latérale (ordinateur, à partir de 1 024 px). L'indicateur actif glisse d'un lien à l'autre. */
export function BarreLaterale({ titres, etapes }: { titres: Record<string, string>; etapes: Record<string, number> }) {
  const chemin = usePathname();
  const indice = liens.findIndex((l) => l.actif(chemin));
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-bg px-4 py-5 lg:flex">
      <Link href="/" className="mb-8 px-2" aria-label="Méridien, accueil">
        <Logo />
      </Link>
      <nav aria-label="Navigation principale">
        <ul className="relative space-y-1">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-11 rounded-xl border border-brand/30 bg-brand-soft transition-[transform,opacity] duration-300 ease-[var(--ease-out-soft)]"
            style={{ transform: `translateY(${Math.max(0, indice) * 3}rem)`, opacity: indice < 0 ? 0 : 1 }}
          />
          {liens.map(({ href, libelle, Icone, actif }) => {
            const courant = actif(chemin);
            return (
              <li key={href} className="relative">
                <Link
                  href={href}
                  aria-current={courant ? "page" : undefined}
                  className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] font-medium transition-colors ${
                    courant ? "text-ink" : "text-ink-2 hover:bg-surface hover:text-ink"
                  }`}
                >
                  <Icone className={`size-5 transition-colors ${courant ? "text-brand" : ""}`} />
                  {libelle}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto">
        <Reprise titres={titres} etapes={etapes} />
        <p className="px-1 text-[0.7rem] leading-relaxed text-ink-3">
          Plateforme d&apos;apprentissage gratuite. Aucun conseil en investissement, aucun signal. Le trading comporte un risque élevé de perte.
        </p>
      </div>
    </aside>
  );
}

/** Barre de navigation inférieure (mobile et tablette), avec pastille active qui glisse. */
export function BarreBas() {
  const chemin = usePathname();
  const indice = liens.findIndex((l) => l.actif(chemin));
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="relative mx-auto grid max-w-lg grid-cols-5">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-[3px] w-1/5 transition-[transform,opacity] duration-300 ease-[var(--ease-out-soft)]"
          style={{ transform: `translateX(${Math.max(0, indice) * 100}%)`, opacity: indice < 0 ? 0 : 1 }}
        >
          <span className="mx-auto block h-full w-8 rounded-b-full" style={{ background: "var(--meridien)" }} />
        </span>
        {liens.map(({ href, libelle, Icone, actif }) => {
          const courant = actif(chemin);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={courant ? "page" : undefined}
                className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors active:scale-95 ${
                  courant ? "text-ink" : "text-ink-3"
                }`}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-300 ${courant ? "bg-brand-soft text-brand" : ""}`}>
                  <Icone className="size-[1.3rem]" />
                </span>
                {libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
