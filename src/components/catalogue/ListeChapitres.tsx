import Link from "next/link";
import { chapitre } from "@/content";
import { typographie } from "@/lib/typographie";
import { EtatChapitre } from "../progression/Indicateurs";
import { IconeCadenas } from "../ui/Icones";

/** Liste de chapitres : lien vers ceux qui sont publiés, mention « bientôt » pour les autres. */
export function ListeChapitres({ chapitres, numeroter = true }: { chapitres: { slug: string; titre: string }[]; numeroter?: boolean }) {
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line">
      {chapitres.map((item, i) => {
        const c = chapitre(item.slug);
        const numero = numeroter ? <span className="w-7 shrink-0 font-mono text-sm text-ink-3">{String(i + 1).padStart(2, "0")}</span> : null;
        if (!c) {
          return (
            <li key={item.slug} className="flex items-center gap-3 bg-bg px-4 py-3.5 text-ink-3">
              {numero}
              <span className="flex-1">{typographie(item.titre)}</span>
              <span className="inline-flex items-center gap-1 text-xs">
                <IconeCadenas className="size-3.5" /> Bientôt
              </span>
            </li>
          );
        }
        return (
          <li key={item.slug}>
            <Link href={`/chapitre/${c.slug}/`} className="flex items-center gap-3 bg-surface px-4 py-3.5 transition-colors hover:bg-overlay">
              {numero}
              <span className="flex-1">
                <span className="block font-medium text-ink">{typographie(c.titre)}</span>
                <span className="mt-0.5 block text-sm text-ink-3">{c.dureeMin} min</span>
              </span>
              <EtatChapitre slug={c.slug} />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
