import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeFiabilite } from "@/components/ui/BadgeFiabilite";
import { chapitre, emplacement } from "@/content";
import { glossaire, termeParSlug } from "@/content/glossaire";
import { typographie } from "@/lib/typographie";

export const dynamicParams = false;

export function generateStaticParams() {
  return glossaire.map((t) => ({ terme: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/glossaire/[terme]">): Promise<Metadata> {
  const t = termeParSlug.get((await params).terme);
  return t ? { title: `${t.terme} : définition`, description: t.court } : {};
}

export default async function PageTerme({ params }: PageProps<"/glossaire/[terme]">) {
  const t = termeParSlug.get((await params).terme);
  if (!t) notFound();
  const ch = t.chapitre ? chapitre(t.chapitre) : undefined;
  const lieu = t.chapitre && !ch ? emplacement(t.chapitre) : undefined;
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-ink-3">
        <Link href="/glossaire/" className="hover:text-ink">
          Glossaire
        </Link>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{typographie(t.terme)}</h1>
      {t.synonymes.length > 0 ? <p className="mt-1 text-ink-3">Aussi : {t.synonymes.join(", ")}</p> : null}
      <div className="mt-4">
        <BadgeFiabilite fiabilite={t.fiabilite} />
      </div>
      <p className="mt-5 text-lg font-medium leading-relaxed text-ink">{typographie(t.court)}</p>
      <p className="prose-cours mt-4 text-ink-2">{typographie(t.long)}</p>

      {ch ? (
        <Link href={`/chapitre/${ch.slug}/`} className="mt-8 block rounded-xl border border-line bg-surface p-4 hover:border-brand/60">
          <span className="block text-sm text-ink-3">Expliqué en détail dans le chapitre</span>
          <span className="font-medium text-ink">{typographie(ch.titre)}</span>
        </Link>
      ) : lieu ? (
        <p className="mt-8 rounded-xl border border-line bg-surface p-4 text-sm text-ink-3">
          {typographie(`Expliqué en détail dans le module « ${lieu.module.titre} », en préparation.`)}
        </p>
      ) : null}

      {t.voirAussi.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-ink">Voir aussi</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {t.voirAussi.map((s) => {
              const v = termeParSlug.get(s)!;
              return (
                <li key={s}>
                  <Link href={`/glossaire/${s}/`} className="inline-block rounded-full border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-brand/60 hover:text-ink">
                    {typographie(v.terme)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
