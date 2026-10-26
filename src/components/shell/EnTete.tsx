import Link from "next/link";
import { IconeReglages } from "../ui/Icones";
import { Logo } from "./Logo";
import { Recherche } from "./Recherche";

export function EnTete() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="lg:hidden" aria-label="Méridien, accueil">
          <Logo />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Recherche />
          <Link
            href="/parametres/"
            className="inline-flex size-10 items-center justify-center rounded-lg text-ink-2 hover:bg-surface hover:text-ink"
            aria-label="Réglages"
          >
            <IconeReglages />
          </Link>
        </div>
      </div>
    </header>
  );
}
