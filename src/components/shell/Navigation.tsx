"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgression } from "@/lib/progression/store";
import { Jauge } from "../ui/Progression";
import { IconeBougies, IconeGlossaire, IconeMeridien, IconeModules, IconeProfil, IconeRobot } from "../ui/Icones";
import { Logo } from "./Logo";

const commencePar = (p: string, debuts: string[]) => debuts.some((d) => p.startsWith(d));

const liens = [
  { href: "/", libelle: "Accueil", Icone: IconeMeridien, actif: (p: string) => p === "/" },
  {
    href: "/formations/",
    libelle: "Formations",
    Icone: IconeModules,
    actif: (p: string) => commencePar(p, ["/formations", "/paiement", "/academies", "/chapitre", "/parcours", "/commencer", "/examen"]),
  },
  { href: "/pratique/", libelle: "Pratique", Icone: IconeBougies, actif: (p: string) => p.startsWith("/pratique") },
  { href: "/outils/", libelle: "Outils", Icone: IconeRobot, actif: (p: string) => p.startsWith("/outils") },
  { href: "/glossaire/", libelle: "Glossaire", Icone: IconeGlossaire, actif: (p: string) => p.startsWith("/glossaire"), mobile: false },
  {
    href: "/tableau-de-bord/",
    libelle: "Moi",
    Icone: IconeProfil,
    actif: (p: string) => commencePar(p, ["/tableau-de-bord", "/parametres", "/compte", "/connexion", "/inscription", "/certificat", "/mot-de-passe"]),
  },
];
/** Barre du bas sur mobile : cinq entrées ; le glossaire reste accessible par la recherche et les cours. */
const liensMobiles = liens.filter((l) => l.mobile !== false);

/** Reprise rapide : le chapitre en cours et son avancement, en bas de la barre latérale. */
function Reprise({ titres, etapes }: { titres: Record<string, string>; etapes: Record<string, number> }) {
  const p = useProgression();
  const slug = p.dernierChapitre;
  const c = slug ? p.chapitres[slug] : undefined;
  if (!slug || !c || !titres[slug]) return null;
  const total = etapes[slug] ?? 10;
  const avance = c.statut === "termine" ? 1 : Math.min(1, (c.etape + 1) / total);
  return (
    <Link href={`/chapitre/${slug}/`} className="carte carte-lien mb-4 block p-3.5">
      <span className="surtitre">{c.statut === "termine" ? "Dernier chapitre" : "Reprendre le cours"}</span>
      <span className="mt-1 line-clamp-2 block text-sm font-medium leading-snug text-ink">{titres[slug]}</span>
      <Jauge valeur={avance} libelle="Avancement du chapitre" className="mt-2.5" />
    </Link>
  );
}

/** Barre latérale (ordinateur, à partir de 1 024 px). Le repère safran glisse d'un lien à l'autre. */
export function BarreLaterale({ titres, etapes }: { titres: Record<string, string>; etapes: Record<string, number> }) {
  const chemin = usePathname();
  const indice = liens.findIndex((l) => l.actif(chemin));
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-bg px-4 py-5 [view-transition-name:barre-laterale] lg:flex">
      <Link href="/" className="mb-9 px-2" aria-label="Méridien, accueil">
        <Logo />
      </Link>
      <nav aria-label="Navigation principale">
        <ul className="relative space-y-0.5">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-11 w-[3px] bg-accent transition-[transform,opacity] duration-300 ease-[var(--ease-out-soft)]"
            style={{ transform: `translateY(${Math.max(0, indice) * 2.875}rem)`, opacity: indice < 0 ? 0 : 1 }}
          />
          {liens.map(({ href, libelle, Icone, actif }) => {
            const courant = actif(chemin);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={courant ? "page" : undefined}
                  className={`flex h-11 items-center gap-3 rounded-md pl-4 pr-3 text-[0.95rem] transition-colors ${
                    courant ? "font-semibold text-ink" : "font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  <Icone className="size-[1.15rem]" />
                  {libelle}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto">
        <Reprise titres={titres} etapes={etapes} />
        <Link href="/legal/risques/" className="px-1 text-xs text-ink-3 hover:text-ink hover:underline hover:underline-offset-4">
          Avertissement sur les risques
        </Link>
      </div>
    </aside>
  );
}

/**
 * Barre de navigation inférieure (mobile et tablette). Le repère safran glisse au-dessus de l'onglet actif, dont
 * l'icône remonte d'un pixel ; un appui enfonce l'onglet. La barre reste fixe pendant les transitions de page.
 */
export function BarreBas() {
  const chemin = usePathname();
  const indice = liensMobiles.findIndex((l) => l.actif(chemin));
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md [view-transition-name:barre-bas] lg:hidden"
    >
      <ul className="relative mx-auto grid max-w-lg grid-cols-5">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 flex h-[2px] w-1/5 justify-center transition-[transform,opacity] duration-300 ease-[var(--ease-out-soft)]"
          style={{ transform: `translateX(${Math.max(0, indice) * 100}%)`, opacity: indice < 0 ? 0 : 1 }}
        >
          <span className="block h-full w-10 bg-accent" />
        </span>
        {liensMobiles.map(({ href, libelle, Icone, actif }) => {
          const courant = actif(chemin);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={courant ? "page" : undefined}
                className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-1 text-[0.7rem] tracking-[0.01em] transition-[color,transform] duration-150 active:scale-[0.92] ${
                  courant ? "font-semibold text-ink" : "font-medium text-ink-3"
                }`}
              >
                <Icone className={`size-[1.35rem] transition-transform duration-300 ease-[var(--ease-out-soft)] ${courant ? "-translate-y-px" : ""}`} />
                {libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
