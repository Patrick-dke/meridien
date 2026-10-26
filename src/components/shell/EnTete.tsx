import Link from "next/link";
import { IconeReglages } from "../ui/Icones";
import { Logo } from "./Logo";
import { Recherche } from "./Recherche";

export function EnTete() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="lg:hidden" aria-label="Méridien, accueil">
          <Logo />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Recherche />
          <Link href="/parametres/" className="btn btn-discret !min-h-10 !px-0 size-10" aria-label="Réglages">
            <IconeReglages />
          </Link>
        </div>
      </div>
    </header>
  );
}
