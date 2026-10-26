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
import { AvancementChapitre } from "@/components/chapitre/AvancementChapitre";
import { IconeHorloge } from "@/components/ui/Icones";
import { Niveau } from "@/components/ui/Progression";
import { Puce } from "@/components/ui/Puce";
import { Vignette } from "@/components/ui/Vignette";
import { chapitre, chapitresPublies, emplacement, fiche, parcours, suivantDansParcours } from "@/content";
import { conceptParId } from "@/content/concepts";
import { libellesMarches, libellesStrategies } from "@/content/identite";
import { narration } from "@/content/narrations";
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
          <TitreEtape surtitre="Capsule" sous="L'essentiel du chapitre en moins de 90 secondes : écoute, regarde, puis passe au cours.">
            {c.capsule.titre}
          </TitreEtape>
          <Capsule titre={c.capsule.titre} scenes={c.capsule.scenes} narration={narration(slug)} />
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

  const f = fiche(slug)!;
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
      <header className="carte relative mb-8 overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 [mask-image:linear-gradient(to_right,transparent,#000)] md:block" aria-hidden="true">
          <Vignette motif={f.motif} teinte={f.teinte} graine={slug} className="h-full" />
        </div>
        <div className="relative flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {rangParcours >= 0 ? (
                <Puce ton="cyan">
                  Premiers pas · {rangParcours + 1}/{parcours.length}
                </Puce>
              ) : null}
              <Puce>{libellesStrategies[f.strategie]}</Puce>
              <Puce>{f.marches.length ? f.marches.map((m) => libellesMarches[m]).join(", ") : "Tous les marchés"}</Puce>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">{typographie(c.titre)}</h1>
            <p className="mt-2 text-lg text-ink-2">{typographie(c.sousTitre)}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <IconeHorloge className="size-4" /> {c.dureeMin} min
              </span>
              <Niveau niveau={c.niveau} />
              <span>{etapes.length} étapes</span>
              <span>Mis à jour le {new Date(c.misAJour).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>
          <div className="hidden shrink-0 sm:block">
            <AvancementChapitre slug={slug} etapes={etapes.length} />
          </div>
        </div>
        <p className="relative mt-4 max-w-3xl text-xs leading-relaxed text-ink-3">
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
        <div className="relative mt-4">
          <OutilsChapitre slug={slug} />
        </div>
      </header>
      <LecteurChapitre slug={slug} etapes={etapes} />
    </article>
  );
}
