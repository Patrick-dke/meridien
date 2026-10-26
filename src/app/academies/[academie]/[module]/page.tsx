import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarteChapitre } from "@/components/catalogue/Cartes";
import { ProgressionListe } from "@/components/progression/Indicateurs";
import { Vignette } from "@/components/ui/Vignette";
import { academie, academies, etapesParChapitre, fiche, module } from "@/content";
import { identiteModules, libellesStrategies, teintesAcademies } from "@/content/identite";
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
  const fichesModule = m.chapitres.map((c) => fiche(c.slug)!);
  const publies = fichesModule.filter((f) => f.publie).map((f) => f.slug);
  const id = identiteModules[m.slug];
  const teinte = teintesAcademies[a.slug];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-5 text-sm text-ink-3">
        <Link href="/academies/" className="hover:text-ink">
          Apprendre
        </Link>
        {" / "}
        <Link href={`/academies/${a.slug}/`} className="hover:text-ink">
          {a.titre}
        </Link>
      </nav>
      <header className="carte grid overflow-hidden md:grid-cols-[1.3fr_1fr]">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: teinte }}>
            {a.code} · {libellesStrategies[id.strategie]}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">{typographie(m.titre)}</h1>
          <p className="mt-3 max-w-2xl text-ink-2">{typographie(m.description)}</p>
          {publies.length > 0 ? (
            <div className="mt-6 max-w-md">
              <ProgressionListe slugs={publies} libelle="Chapitres disponibles terminés" />
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-line bg-surface p-4 text-sm text-ink-2">
              {typographie(
                "Ce module est en préparation : ses chapitres seront publiés après rédaction et vérification. En attendant, le parcours « Premiers pas » pose les bases nécessaires.",
              )}
            </p>
          )}
        </div>
        <div className="hidden border-l border-line md:block">
          <Vignette motif={id.motif} teinte={teinte} graine={`module-${m.slug}`} className="h-full" />
        </div>
      </header>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fichesModule.map((f, i) => (
          <li key={f.slug} className="revele" style={{ ["--i" as string]: i % 6 }}>
            <CarteChapitre f={f} etapes={etapesParChapitre[f.slug]} rang={i + 1} />
          </li>
        ))}
      </ol>
    </div>
  );
}
