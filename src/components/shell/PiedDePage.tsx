import Link from "next/link";

export function PiedDePage() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 text-sm text-ink-3 sm:px-6">
        <p className="max-w-3xl leading-relaxed">
          <strong className="font-semibold text-ink-2">Avertissement sur les risques.</strong> Méridien est un site
          d&apos;apprentissage gratuit. Il ne fournit ni conseil en investissement personnalisé, ni signal d&apos;achat ou de
          vente. Le trading, en particulier avec effet de levier, comporte un risque élevé de perte en capital. Les exemples
          utilisent des données synthétiques ou passées, qui ne présagent pas des résultats futurs.
        </p>
        <nav aria-label="Liens de bas de page" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/methode/" className="hover:text-ink">Méthode et fiabilité</Link>
          <Link href="/legal/risques/" className="hover:text-ink">Risques</Link>
          <Link href="/legal/confidentialite/" className="hover:text-ink">Confidentialité</Link>
          <Link href="/legal/mentions/" className="hover:text-ink">Mentions légales</Link>
          <Link href="/parametres/" className="hover:text-ink">Réglages et données</Link>
        </nav>
      </div>
    </footer>
  );
}
