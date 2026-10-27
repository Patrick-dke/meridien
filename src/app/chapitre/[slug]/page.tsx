import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { construireEtapes } from "@/components/chapitre/EtapesChapitre";
import { LecteurChapitre } from "@/components/chapitre/LecteurChapitre";
import { LecteurProtege } from "@/components/chapitre/LecteurProtege";
import { OutilsChapitre } from "@/components/chapitre/OutilsChapitre";
import { AvancementChapitre } from "@/components/chapitre/AvancementChapitre";
import { IconeHorloge } from "@/components/ui/Icones";
import { Niveau } from "@/components/ui/Progression";
import { Puce } from "@/components/ui/Puce";
import { Vignette } from "@/components/ui/Vignette";
import { chapitre, chapitresPublies, emplacement, fiche, parcours, suivantDansParcours } from "@/content";
import { libellesMarches, libellesStrategies } from "@/content/identite";
import { narration } from "@/content/narrations";
import { moduleDuChapitre, offre } from "@/content/offre";
import { typographie } from "@/lib/typographie";

export const dynamicParams = false;

/** Chapitres payants : seule leur coquille publique (titre, module) est publiée ; le contenu vient de la base. */
const chapitresPayants = offre.filter((m) => !m.gratuit).flatMap((m) => m.chapitres);

export function generateStaticParams() {
  return [...chapitresPublies.map((c) => c.slug), ...chapitresPayants.filter((s) => !chapitre(s))].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/chapitre/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = chapitre(slug);
  if (c) return { title: c.titre, description: `${c.sousTitre}. ${c.intro}`.slice(0, 300) };
  const f = fiche(slug);
  const m = moduleDuChapitre(slug);
  return f && m ? { title: f.titre, description: `Chapitre du module « ${m.titre} » : ${m.accroche}` } : {};
}

export default async function PageChapitre({ params }: PageProps<"/chapitre/[slug]">) {
  const { slug } = await params;
  const c = chapitre(slug);
  if (!c) return <ChapitrePayant slug={slug} />;
  const lieu = emplacement(slug);
  const suivant = suivantDansParcours(slug);
  const rangParcours = parcours.indexOf(slug);

  const etapes = construireEtapes({ c, narration: narration(slug), suivant: suivant ? { slug: suivant.slug, titre: suivant.titre } : null });

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

function ChapitrePayant({ slug }: { slug: string }) {
  const f = fiche(slug);
  const m = moduleDuChapitre(slug);
  if (!f || !m) notFound();
  const rang = m.chapitres.indexOf(slug);
  const suivantSlug = m.chapitres[rang + 1];
  const suivant = suivantSlug ? { slug: suivantSlug, titre: fiche(suivantSlug)?.titre ?? suivantSlug } : null;
  return (
    <article className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-ink-3">
        <Link href="/formations/" className="hover:text-ink">
          Formations
        </Link>
        {" / "}
        <Link href={`/formations/${m.id}/`} className="hover:text-ink">
          {m.titre}
        </Link>
      </nav>
      <header className="carte relative mb-8 overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 [mask-image:linear-gradient(to_right,transparent,#000)] md:block" aria-hidden="true">
          <Vignette motif={f.motif} teinte={f.teinte} graine={slug} className="h-full" />
        </div>
        <div className="relative min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Puce ton="cyan">
              {m.titre} · {rang + 1}/{m.chapitres.length}
            </Puce>
            <Puce>{libellesStrategies[f.strategie]}</Puce>
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">{typographie(f.titre)}</h1>
          <p className="mt-2 text-lg text-ink-2">{typographie(m.accroche)}</p>
        </div>
      </header>
      <LecteurProtege slug={slug} module={m.id} titreModule={m.titre} suivant={suivant} />
    </article>
  );
}
