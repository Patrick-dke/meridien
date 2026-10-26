import Link from "next/link";
import { conceptParId } from "@/content/concepts";
import type { Chapitre } from "@/content/schema";
import { typographie } from "@/lib/typographie";
import { RenduBlocs } from "../contenu/Blocs";
import { TexteRiche } from "../contenu/TexteRiche";
import { IconeCible, IconeCroix } from "../ui/Icones";
import { CoursProgressif } from "./CoursProgressif";

export function TitreEtape({ children, sous, surtitre }: { children: React.ReactNode; sous?: string; surtitre?: string }) {
  return (
    <header className="mb-7">
      {surtitre ? <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan">{surtitre}</p> : null}
      <h2 className="text-2xl font-semibold text-ink sm:text-[1.7rem]">{children}</h2>
      {sous ? <p className="mt-1.5 text-ink-2">{typographie(sous)}</p> : null}
    </header>
  );
}

export function EtapeIntroduction({ c }: { c: Chapitre }) {
  const prerequis = c.prerequis.map((id) => conceptParId.get(id)).filter((x) => x !== undefined);
  return (
    <div className="max-w-3xl">
      <TitreEtape surtitre="Introduction">Ce que tu vas apprendre</TitreEtape>
      <p className="prose-cours">
        <TexteRiche texte={c.intro} />
      </p>
      <ol className="mt-7 grid gap-3 sm:grid-cols-2">
        {c.objectifs.map((o, i) => (
          <li key={o} className="revele carte flex gap-3 p-4" style={{ ["--i" as string]: i }}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-brand/30 bg-brand-soft font-mono text-sm text-brand">{i + 1}</span>
            <span className="text-[0.97rem] leading-relaxed text-ink">{typographie(o)}</span>
          </li>
        ))}
      </ol>
      {prerequis.length > 0 ? (
        <div className="mt-6">
          <p className="mb-2 text-sm text-ink-2">À connaître avant :</p>
          <ul className="flex flex-wrap gap-2">
            {prerequis.map((p) => (
              <li key={p.id}>
                <Link href={`/chapitre/${p.chapitre}/`} className="inline-flex min-h-8 items-center rounded-full border border-line-strong px-3 text-sm text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                  {p.nom}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <aside className="carte mt-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-3 text-sm text-ink-2">
          <IconeCible className="size-5 shrink-0 text-cyan" />
          Tu maîtrises déjà ce sujet ? Réussis le quiz pour valider le chapitre directement.
        </p>
        <a href="#etape-quiz" className="btn btn-secondaire shrink-0 !min-h-10 text-sm">
          Je connais déjà : aller au quiz
        </a>
      </aside>
    </div>
  );
}

export function EtapeCours({ c }: { c: Chapitre }) {
  return (
    <div>
      <TitreEtape surtitre="Cours" sous={`${c.cours.length} notions, à lire dans l'ordre.`}>
        Le cours
      </TitreEtape>
      <CoursProgressif titres={c.cours.map((s) => s.titre)}>
        {c.cours.map((s, i) => (
          <section key={s.titre} aria-label={s.titre}>
            <h3 className="mb-4 flex items-baseline gap-3 text-xl font-semibold text-ink">
              <span className="font-mono text-sm text-cyan">{String(i + 1).padStart(2, "0")}</span>
              {typographie(s.titre)}
            </h3>
            <RenduBlocs blocs={s.blocs} />
          </section>
        ))}
      </CoursProgressif>
    </div>
  );
}

export function EtapeErreurs({ c }: { c: Chapitre }) {
  return (
    <div>
      <TitreEtape surtitre="Pièges" sous="Les erreurs et mauvaises interprétations les plus courantes.">
        Erreurs fréquentes
      </TitreEtape>
      <ul className="grid max-w-4xl gap-4 md:grid-cols-2">
        {c.erreurs.map((e, i) => (
          <li key={e.titre} className="revele carte overflow-hidden" style={{ ["--i" as string]: i }}>
            <div className="flex items-center gap-2 border-b border-line bg-bad/[0.07] px-4 py-2.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-bad/15 text-bad">
                <IconeCroix className="size-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-bad">Piège {i + 1}</span>
            </div>
            <div className="p-4">
              <p className="font-semibold text-ink">{typographie(e.titre)}</p>
              <p className="mt-1.5 text-[0.97rem] leading-relaxed text-ink-2">
                <TexteRiche texte={e.texte} />
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EtapeResume({ c }: { c: Chapitre }) {
  return (
    <div>
      <TitreEtape surtitre="Résumé" sous="Les points à garder en tête, une carte par idée.">
        L&apos;essentiel
      </TitreEtape>
      <ol className="grid max-w-4xl gap-4 sm:grid-cols-2">
        {c.resume.map((r, i) => (
          <li key={r} className="revele carte relative overflow-hidden p-5" style={{ ["--i" as string]: i }}>
            <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: "var(--meridien)" }} aria-hidden="true" />
            <span className="font-mono text-3xl font-semibold text-brand/50">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-ink">
              <TexteRiche texte={r} />
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
