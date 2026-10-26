"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

/** Barre latérale (ordinateur, à partir de 1 024 px). */
export function BarreLaterale() {
  const chemin = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-bg/95 px-4 py-5 lg:flex">
      <Link href="/" className="mb-8 px-2" aria-label="Méridien, accueil">
        <Logo />
      </Link>
      <nav aria-label="Navigation principale">
        <ul className="space-y-1">
          {liens.map(({ href, libelle, Icone, actif }) => {
            const courant = actif(chemin);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={courant ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.95rem] font-medium transition-colors ${
                    courant ? "bg-brand-soft text-ink" : "text-ink-2 hover:bg-surface hover:text-ink"
                  }`}
                >
                  <Icone className={`size-5 ${courant ? "text-brand" : ""}`} />
                  {libelle}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto rounded-xl border border-line bg-surface p-4 text-xs leading-relaxed text-ink-3">
        Plateforme d&apos;apprentissage gratuite. Aucun conseil en investissement, aucun signal. Le trading comporte un risque élevé de perte.
      </div>
    </aside>
  );
}

/** Barre de navigation inférieure (mobile et tablette). */
export function BarreBas() {
  const chemin = usePathname();
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {liens.map(({ href, libelle, Icone, actif }) => {
          const courant = actif(chemin);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={courant ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium ${
                  courant ? "text-brand" : "text-ink-3"
                }`}
              >
                <Icone className="size-[1.35rem]" />
                {libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
