import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarteEnsemble } from "@/components/catalogue/CarteEnsemble";
import { BadgeFiabilite } from "@/components/ui/BadgeFiabilite";
import { Vignette } from "@/components/ui/Vignette";
import { academie, academies, fiche } from "@/content";
import { identiteModules, libellesStrategies, motifsAcademies, teintesAcademies } from "@/content/identite";
import { typographie } from "@/lib/typographie";

export const dynamicParams = false;

export function generateStaticParams() {
  return academies.map((a) => ({ academie: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/academies/[academie]">): Promise<Metadata> {
  const a = academie((await params).academie);
  return a ? { title: a.titre, description: a.description } : {};
}

export default async function PageAcademie({ params }: PageProps<"/academies/[academie]">) {
  const a = academie((await params).academie);
  if (!a) notFound();
  const teinte = teintesAcademies[a.slug];
  const total = a.modules.reduce((n, m) => n + m.chapitres.length, 0);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-5 text-sm text-ink-3">
        <Link href="/academies/" className="hover:text-ink">
          Apprendre
        </Link>
      </nav>
      <header className="carte grid overflow-hidden lg:grid-cols-[1.2fr_1fr]">
        <div className="p-6 sm:p-8">
          <p className="font-mono text-sm" style={{ color: teinte }}>
            {a.code} · {a.niveau}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">{typographie(a.titre)}</h1>
          <p className="mt-3 max-w-2xl text-ink-2">{typographie(a.description)}</p>
          <p className="mt-4 text-sm text-ink-3">
            {a.modules.length} module{a.modules.length > 1 ? "s" : ""} · {total} chapitres
          </p>
          {a.ecole ? (
            <div className="mt-5 flex max-w-2xl flex-col gap-2 rounded-xl border border-warn/40 bg-warn/5 p-4 text-sm text-ink-2">
              <BadgeFiabilite fiabilite="ecole" />
              <p>
                {typographie(
                  "Les concepts de cette académie appartiennent à une école d'analyse. Ils sont enseignés comme des lectures du marché et des hypothèses à tester, jamais comme des mécanismes démontrés.",
                )}
              </p>
            </div>
          ) : null}
        </div>
        <div className="hidden border-l border-line lg:block">
          <Vignette motif={motifsAcademies[a.slug]} teinte={teinte} graine={`academie-${a.slug}`} className="h-full" />
        </div>
      </header>

      <h2 className="mt-12 text-2xl font-semibold text-ink">Les modules</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {a.modules.map((m, i) => {
          const slugs = m.chapitres.map((c) => c.slug);
          const publies = slugs.filter((s) => fiche(s)?.publie);
          const duree = publies.reduce((t, s) => t + (fiche(s)?.dureeMin ?? 0), 0);
          const id = identiteModules[m.slug];
          return (
            <li key={m.slug} className="revele" style={{ ["--i" as string]: i % 6 }}>
              <CarteEnsemble
                href={`/academies/${a.slug}/${m.slug}/`}
                surtitre={`Module ${i + 1} · ${libellesStrategies[id.strategie]}`}
                titre={m.titre}
                description={m.description}
                motif={id.motif}
                teinte={teinte}
                publies={publies}
                total={slugs.length}
                details={[`${slugs.length} chapitres`, `Niveau ${id.niveau}`, ...(duree ? [`${duree} min disponibles`] : [])]}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
