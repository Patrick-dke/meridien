import Link from "next/link";
import { Logo } from "./Logo";

const colonnes = [
  {
    titre: "Formation",
    liens: [
      ["/formations/", "Formations et tarifs"],
      ["/parcours/premiers-pas/", "Introduction gratuite"],
      ["/methode/", "Méthode pédagogique"],
      ["/glossaire/", "Glossaire"],
    ],
  },
  {
    titre: "Outils",
    liens: [
      ["/outils/", "Indicateurs et robots"],
      ["/pratique/", "Calculateurs et simulateur"],
    ],
  },
  {
    titre: "Informations",
    liens: [
      ["/legal/conditions/", "Conditions de vente"],
      ["/legal/risques/", "Risques du trading"],
      ["/legal/confidentialite/", "Confidentialité"],
      ["/legal/mentions/", "Mentions légales"],
      ["/#contact", "Contact"],
    ],
  },
] as const;

export function PiedDePage() {
  return (
    <footer className="mt-20 border-t border-line-strong">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-2">Comprends les marchés, construis ta méthode, passe à la pratique. Huit modules, dont le premier est gratuit.</p>
        </div>
        {colonnes.map((c) => (
          <nav key={c.titre} aria-label={c.titre}>
            <p className="surtitre">{c.titre}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.liens.map(([href, libelle]) => (
                <li key={href}>
                  <Link href={href} className="text-ink-2 hover:text-ink hover:underline hover:underline-offset-4">
                    {libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-ink-3 sm:px-6">
          <strong className="font-semibold text-ink-2">Risques.</strong> Méridien forme au trading ; il ne fournit ni conseil en investissement
          personnalisé, ni signal, ni gestion de compte. Le trading, en particulier avec effet de levier, comporte un risque élevé de perte en
          capital. Les exemples utilisent des données synthétiques ou passées, qui ne présagent pas des résultats futurs.
        </p>
      </div>
    </footer>
  );
}
