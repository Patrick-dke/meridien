import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Capsule } from "@/components/chapitre/Capsule";
import { EtapeCours, EtapeErreurs, EtapeIntroduction, EtapeResume, TitreEtape } from "@/components/chapitre/Etapes";
import { LecteurChapitre, type Etape } from "@/components/chapitre/LecteurChapitre";
import { OutilsChapitre } from "@/components/chapitre/OutilsChapitre";
import { Quiz } from "@/components/chapitre/Quiz";
import { Validation } from "@/components/chapitre/Validation";
import { RenduBlocs } from "@/components/contenu/Blocs";
import { IconeHorloge } from "@/components/ui/Icones";
import { chapitre, chapitresPublies, emplacement, parcours, suivantDansParcours } from "@/content";
import { conceptParId } from "@/content/concepts";
import { typographie } from "@/lib/typographie";

export const dynamicParams = false;

export function generateStaticParams() {
  return chapitresPublies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/chapitre/[slug]">): Promise<Metadata> {
  const c = chapitre((await params).slug);
  if (!c) return {};
  return { title: c.titre, description: `${c.sousTitre}. ${c.intro}`.slice(0, 300) };
}

export default async function PageChapitre({ params }: PageProps<"/chapitre/[slug]">) {
  const { slug } = await params;
  const c = chapitre(slug);
  if (!c) notFound();
  const lieu = emplacement(slug);
  const suivant = suivantDansParcours(slug);
  const rangParcours = parcours.indexOf(slug);

  const concepts = [...new Set([...c.concepts, ...c.quiz.flatMap((q) => q.concepts)])];
  const nomsConcepts = Object.fromEntries(concepts.map((id) => [id, conceptParId.get(id)?.nom ?? id]));

  const etapes: Etape[] = [
    { id: "introduction", libelle: "Introduction", contenu: <EtapeIntroduction c={c} /> },
    {
      id: "capsule",
      libelle: "Capsule",
      contenu: (
        <div className="max-w-3xl">
          <TitreEtape sous="L'essentiel du chapitre en une capsule animée.">{c.capsule.titre}</TitreEtape>
          <Capsule titre={c.capsule.titre} scenes={c.capsule.scenes} />
        </div>
      ),
    },
    { id: "cours", libelle: "Cours", contenu: <EtapeCours c={c} /> },
    ...(c.illustrations.length > 0
      ? [
          {
            id: "illustrations",
            libelle: "Illustrations",
            contenu: (
              <div>
                <TitreEtape>Illustrations</TitreEtape>
                <RenduBlocs blocs={c.illustrations} />
              </div>
            ),
          },
        ]
      : []),
    ...(c.exemple
      ? [
          {
            id: "exemple",
            libelle: "Exemple",
            contenu: (
              <div>
                <TitreEtape>{typographie(c.exemple.titre)}</TitreEtape>
                <RenduBlocs blocs={c.exemple.blocs} />
              </div>
            ),
          },
        ]
      : []),
    { id: "erreurs", libelle: "Erreurs fréquentes", contenu: <EtapeErreurs c={c} /> },
    { id: "resume", libelle: "Résumé", contenu: <EtapeResume c={c} /> },
    {
      id: "quiz",
      libelle: "Quiz",
      contenu: (
        <div className="max-w-2xl">
          <TitreEtape sous={`${c.quiz.length} questions, correction immédiate. 80 % de bonnes réponses valident le chapitre.`}>Quiz</TitreEtape>
          <Quiz slug={slug} questions={c.quiz} nomsConcepts={nomsConcepts} />
        </div>
      ),
    },
    {
      id: "validation",
      libelle: "Validation",
      contenu: (
        <div className="max-w-2xl">
          <TitreEtape>Validation</TitreEtape>
          <Validation
            slug={slug}
            concepts={c.concepts.map((id) => ({ id, nom: nomsConcepts[id] }))}
            suivant={suivant ? { slug: suivant.slug, titre: suivant.titre } : null}
          />
        </div>
      ),
    },
  ];

  return (
    <article className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-ink-3">
        <Link href="/academies/" className="hover:text-ink">
          Apprendre
        </Link>
        {lieu ? (
          <>
            {" / "}
            <Link href={`/academies/${lieu.academie.slug}/`} className="hover:text-ink">
              {lieu.academie.titre}
            </Link>
            {" / "}
            <Link href={`/academies/${lieu.academie.slug}/${lieu.module.slug}/`} className="hover:text-ink">
              {lieu.module.titre}
            </Link>
          </>
        ) : null}
      </nav>
      <header className="mb-6">
        {rangParcours >= 0 ? (
          <p className="mb-2 text-sm font-medium text-brand">
            Parcours « Premiers pas » · chapitre {rangParcours + 1} sur {parcours.length}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{typographie(c.titre)}</h1>
        <p className="mt-2 text-lg text-ink-2">{typographie(c.sousTitre)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <IconeHorloge className="size-4" /> {c.dureeMin} min
          </span>
          <span>Niveau {c.niveau} sur 5</span>
          <span>Mis à jour le {new Date(c.misAJour).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-ink-3">
          Contenu rédigé avec l&apos;aide d&apos;une IA puis vérifié (calculs testés automatiquement, affirmations classées par niveau de
          fiabilité). Une erreur ?{" "}
          <a
            href={`https://github.com/Patrick-dke/meridien/issues/new?title=${encodeURIComponent(`Erreur : ${c.titre}`)}`}
            className="text-brand underline underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            Signale-la
          </a>
          .
        </p>
        <div className="mt-4">
          <OutilsChapitre slug={slug} />
        </div>
      </header>
      <LecteurChapitre slug={slug} etapes={etapes} />
    </article>
  );
}
