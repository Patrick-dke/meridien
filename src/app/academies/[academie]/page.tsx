import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeFiabilite } from "@/components/ui/BadgeFiabilite";
import { academie, academies, estPublie } from "@/content";
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
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-ink-3">
        <Link href="/academies/" className="hover:text-ink">
          Apprendre
        </Link>
      </nav>
      <p className="font-mono text-sm text-ink-3">
        {a.code} · {a.niveau}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{typographie(a.titre)}</h1>
      <p className="mt-2 max-w-2xl text-ink-2">{typographie(a.description)}</p>
      {a.ecole ? (
        <div className="mt-4 flex max-w-2xl flex-col gap-2 rounded-xl border border-warn/40 bg-warn/5 p-4 text-sm text-ink-2">
          <BadgeFiabilite fiabilite="ecole" />
          <p>
            {typographie(
              "Les concepts de cette académie appartiennent à une école d'analyse. Ils sont enseignés comme des lectures du marché et des hypothèses à tester, jamais comme des mécanismes démontrés.",
            )}
          </p>
        </div>
      ) : null}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {a.modules.map((m) => {
          const publies = m.chapitres.filter((c) => estPublie(c.slug)).length;
          return (
            <li key={m.slug}>
              <Link href={`/academies/${a.slug}/${m.slug}/`} className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand/60">
                <h2 className="text-lg font-semibold text-ink">{typographie(m.titre)}</h2>
                <p className="mt-1 flex-1 text-[0.95rem] text-ink-2">{typographie(m.description)}</p>
                <p className={`mt-3 text-sm ${publies ? "text-ok" : "text-ink-3"}`}>
                  {m.chapitres.length} chapitres · {publies ? `${publies} disponibles` : "en préparation"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
