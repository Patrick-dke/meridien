import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlocAchat, LigneProgramme } from "@/components/offre/Offre";
import { IconeCible } from "@/components/ui/Icones";
import { Puce } from "@/components/ui/Puce";
import { Vignette } from "@/components/ui/Vignette";
import { offre } from "@/content/offre";
import { presenter, programme } from "@/content/presentation";
import { typographie } from "@/lib/typographie";

export const dynamicParams = false;

export function generateStaticParams() {
  return offre.map((m) => ({ module: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/formations/[module]">): Promise<Metadata> {
  const { module } = await params;
  const m = offre.find((x) => x.id === module);
  return m ? { title: m.titre, description: m.accroche } : {};
}

export default async function PageModule({ params }: PageProps<"/formations/[module]">) {
  const { module } = await params;
  const m = offre.find((x) => x.id === module);
  if (!m) notFound();
  const p = presenter(m);
  const chapitres = programme(m);
  const precedent = offre.find((x) => x.rang === m.rang - 1);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-ink-3">
        <Link href="/formations/" className="hover:text-ink">
          Formations
        </Link>{" "}
        / {m.titre}
      </nav>
      <header className="carte relative overflow-hidden p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 [mask-image:linear-gradient(to_right,transparent,#000)] md:block" aria-hidden="true">
          <Vignette motif={p.motif} teinte={p.teinte} graine={m.id} className="h-full" />
        </div>
        <div className="relative max-w-2xl">
          <div className="flex flex-wrap gap-2">
            <Puce ton="cyan">Niveau {m.rang} sur {offre.length}</Puce>
            <Puce>{m.chapitres.length} chapitres</Puce>
            {m.gratuit ? <Puce ton="ok">Gratuit, sans compte</Puce> : null}
          </div>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">{typographie(m.titre)}</h1>
          <p className="mt-3 text-lg text-ink-2">{typographie(m.accroche)}</p>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="competences">
            <h2 id="competences" className="text-xl font-semibold text-ink">
              Ce que tu sauras faire
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {m.competences.map((c) => (
                <li key={c} className="carte flex gap-3 p-4 text-ink-2">
                  <IconeCible className="mt-0.5 size-5 shrink-0 text-brand" />
                  {typographie(c)}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="programme">
            <h2 id="programme" className="text-xl font-semibold text-ink">
              Programme
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              Chaque chapitre : introduction, objectifs, capsule vidéo narrée, cours, exemples, illustrations, erreurs fréquentes, résumé, exercices et quiz.
            </p>
            <ol className="carte mt-4 divide-y divide-line p-1.5">
              {chapitres.map((c) => (
                <LigneProgramme key={c.slug} m={p} slug={c.slug} titre={c.titre} numero={c.numero} />
              ))}
            </ol>
          </section>
          {precedent ? (
            <p className="text-sm text-ink-2">
              Prérequis conseillé :{" "}
              <Link href={`/formations/${precedent.id}/`} className="text-brand underline">
                {precedent.titre}
              </Link>
              .
            </p>
          ) : null}
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <BlocAchat m={p} premierChapitre={m.chapitres[0]} />
          <p className="mt-3 px-1 text-xs leading-relaxed text-ink-3">
            Formation pédagogique : aucune promesse de gain. Le trading comporte un risque élevé de perte en capital.
          </p>
        </aside>
      </div>
    </div>
  );
}
