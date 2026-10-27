import Link from "next/link";
import { IconeReglages } from "../ui/Icones";
import { BoutonCompte } from "./BoutonCompte";
import { Logo } from "./Logo";
import { Recherche } from "./Recherche";

export function EnTete() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="lg:hidden" aria-label="Méridien, accueil">
          <Logo />
        </Link>
        <div className="ml-auto flex items-center gap-1 min-[400px]:gap-2">
          <Recherche />
          {/* Sur les plus petits écrans, les réglages restent accessibles par « Moi » : la place va au compte. */}
          <Link href="/parametres/" className="btn btn-discret !min-h-10 !px-0 size-10 max-[399px]:!hidden" aria-label="Réglages">
            <IconeReglages />
          </Link>
          <BoutonCompte />
        </div>
      </div>
    </header>
  );
}
