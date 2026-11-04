import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlocAchat, LigneProgramme } from "@/components/offre/Offre";
import { duree } from "@/lib/duree";
import { IconeCoche } from "@/components/ui/Icones";
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
  const r = p.resume;
  const chapitres = programme(m);
  const precedent = offre.find((x) => x.rang === m.rang - 1);
  const suivant = offre.find((x) => x.rang === m.rang + 1);
  const chiffres: [string, string][] = [
    [String(m.chapitres.length), "chapitres"],
    ...(r
      ? ([
          [duree(r.dureeMin), "de cours"],
          [String(r.capsules), "capsules vidéo"],
          [String(r.exercices), "exercices"],
          [String(r.questions), "questions de quiz"],
        ] as [string, string][])
      : []),
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-3">
        <Link href="/formations/" className="hover:text-ink hover:underline">
          Formations
        </Link>{" "}
        / {m.titre}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_21rem]">
        <div className="min-w-0">
          <header>
            <p className="surtitre">
              Module {m.rang} sur {offre.length} · {m.niveau}
              {m.gratuit ? " · Introduction gratuite" : ""}
            </p>
            <h1 className="mt-2 text-4xl leading-tight text-ink sm:text-5xl" style={{ viewTransitionName: `module-${m.id}` }}>
              {typographie(m.titre)}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-2">{typographie(m.accroche)}</p>
            <dl className="mt-8 grid grid-cols-2 border-y border-line-strong sm:grid-cols-5">
              {chiffres.map(([chiffre, libelle], i) => (
                <div key={libelle} className={`py-4 ${i % 2 ? "pl-4" : ""} sm:pl-4 ${i ? "sm:border-l sm:border-line" : "sm:pl-0"}`}>
                  <dt className="sr-only">{libelle}</dt>
                  <dd>
                    <span className="block font-mono text-xl text-ink tabular">{chiffre}</span>
                    <span className="block text-xs text-ink-3">{libelle}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </header>

          <section aria-labelledby="competences" className="mt-12">
            <h2 id="competences" className="text-2xl text-ink">
              Ce que tu sauras faire
            </h2>
            <ul className="mt-4 space-y-2.5">
              {m.competences.map((c) => (
                <li key={c} className="flex gap-3 text-ink">
                  <IconeCoche className="mt-1 size-4 shrink-0 text-jauge" />
                  {typographie(c)}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="programme" className="mt-12">
            <h2 id="programme" className="text-2xl text-ink">
              Programme
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              Chaque chapitre : capsules vidéo narrées, cours illustré, exemple, exercices sur graphiques, résumé et quiz. Un examen clôt le module.
            </p>
            <ol className="mt-5 divide-y divide-line border-y border-line">
              {chapitres.map((c) => (
                <LigneProgramme key={c.slug} m={p} slug={c.slug} titre={c.titre} numero={c.numero} />
              ))}
              <li>
                <Link href={`/examen/${m.id}/`} className="flex items-center gap-3 px-3 py-3 text-ink hover:bg-surface">
                  <span className="w-7 shrink-0 font-mono text-sm text-jauge">✓</span>
                  <span className="flex-1 font-semibold">Examen de fin de module</span>
                  <span className="text-sm text-ink-3">3 niveaux</span>
                </Link>
              </li>
            </ol>
          </section>

          {precedent || suivant ? (
            <div className="mt-10 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
              {precedent ? (
                <p className="text-sm text-ink-2">
                  <span className="surtitre block">Avant ce module, conseillé</span>
                  <Link href={`/formations/${precedent.id}/`} className="lien mt-1 inline-block">
                    {precedent.titre}
                  </Link>
                </p>
              ) : null}
              {suivant ? (
                <p className="text-sm text-ink-2 sm:col-start-2">
                  <span className="surtitre block">Et ensuite</span>
                  <Link href={`/formations/${suivant.id}/`} className="lien mt-1 inline-block">
                    {suivant.titre}
                  </Link>
                  <span className="mt-1 block">{typographie(suivant.accroche)}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <BlocAchat m={p} premierChapitre={m.chapitres[0]} />
          <p className="mt-3 px-1 text-xs leading-relaxed text-ink-3">
            Avant d&apos;acheter :{" "}
            <Link href="/legal/conditions/" className="underline underline-offset-2 hover:text-ink">
              conditions de vente
            </Link>{" "}
            et{" "}
            <Link href="/legal/risques/" className="underline underline-offset-2 hover:text-ink">
              avertissement sur les risques
            </Link>
            .
          </p>
        </aside>
      </div>
    </div>
  );
}
