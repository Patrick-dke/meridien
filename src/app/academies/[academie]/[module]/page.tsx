import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListeChapitres } from "@/components/catalogue/ListeChapitres";
import { ProgressionListe } from "@/components/progression/Indicateurs";
import { academie, academies, estPublie, module } from "@/content";
import { typographie } from "@/lib/typographie";

export const dynamicParams = false;

export function generateStaticParams() {
  return academies.flatMap((a) => a.modules.map((m) => ({ academie: a.slug, module: m.slug })));
}

export async function generateMetadata({ params }: PageProps<"/academies/[academie]/[module]">): Promise<Metadata> {
  const p = await params;
  const m = module(p.academie, p.module);
  return m ? { title: m.titre, description: m.description } : {};
}

export default async function PageModule({ params }: PageProps<"/academies/[academie]/[module]">) {
  const p = await params;
  const a = academie(p.academie);
  const m = module(p.academie, p.module);
  if (!a || !m) notFound();
  const publies = m.chapitres.filter((c) => estPublie(c.slug)).map((c) => c.slug);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-ink-3">
        <Link href="/academies/" className="hover:text-ink">
          Apprendre
        </Link>
        {" / "}
        <Link href={`/academies/${a.slug}/`} className="hover:text-ink">
          {a.titre}
        </Link>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{typographie(m.titre)}</h1>
      <p className="mt-2 max-w-2xl text-ink-2">{typographie(m.description)}</p>
      {publies.length > 0 ? (
        <div className="mt-6 max-w-md">
          <ProgressionListe slugs={publies} libelle="Chapitres disponibles terminés" />
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-line bg-surface p-4 text-sm text-ink-2">
          {typographie("Ce module est en préparation : ses chapitres seront publiés après rédaction et vérification. En attendant, le parcours « Premiers pas » pose les bases nécessaires.")}
        </p>
      )}
      <div className="mt-6">
        <ListeChapitres chapitres={m.chapitres} />
      </div>
    </div>
  );
}
