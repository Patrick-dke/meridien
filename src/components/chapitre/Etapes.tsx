import Link from "next/link";
import { conceptParId } from "@/content/concepts";
import type { Chapitre } from "@/content/schema";
import { typographie } from "@/lib/typographie";
import { RenduBlocs } from "../contenu/Blocs";
import { TexteRiche } from "../contenu/TexteRiche";

export function TitreEtape({ children, sous }: { children: React.ReactNode; sous?: string }) {
  return (
    <header className="mb-6">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{children}</h2>
      {sous ? <p className="mt-1 text-ink-2">{typographie(sous)}</p> : null}
    </header>
  );
}

export function EtapeIntroduction({ c }: { c: Chapitre }) {
  const prerequis = c.prerequis.map((id) => conceptParId.get(id)).filter((x) => x !== undefined);
  return (
    <div className="prose-cours">
      <TitreEtape>Ce que tu vas apprendre</TitreEtape>
      <p>
        <TexteRiche texte={c.intro} />
      </p>
      <ul>
        {c.objectifs.map((o) => (
          <li key={o}>{typographie(o)}</li>
        ))}
      </ul>
      {prerequis.length > 0 ? (
        <p className="text-[0.95rem] text-ink-2">
          À connaître avant :{" "}
          {prerequis.map((p, i) => (
            <span key={p.id}>
              {i > 0 ? ", " : ""}
              <Link href={`/chapitre/${p.chapitre}/`} className="text-brand underline underline-offset-2">
                {p.nom}
              </Link>
            </span>
          ))}
          .
        </p>
      ) : null}
      <aside className="not-prose mt-6 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-2">Tu maîtrises déjà ce sujet ? Réussis le quiz pour valider le chapitre directement.</p>
        <a href="#etape-quiz" className="shrink-0 rounded-lg border border-line-strong px-3 py-2 text-sm font-medium text-ink hover:border-ink-3">
          Je connais déjà : aller au quiz
        </a>
      </aside>
    </div>
  );
}

export function EtapeCours({ c }: { c: Chapitre }) {
  return (
    <div>
      <TitreEtape>Le cours</TitreEtape>
      <div className="space-y-10">
        {c.cours.map((s) => (
          <section key={s.titre} aria-label={s.titre}>
            <h3 className="mb-4 text-xl font-semibold text-ink">{typographie(s.titre)}</h3>
            <RenduBlocs blocs={s.blocs} />
          </section>
        ))}
      </div>
    </div>
  );
}

export function EtapeErreurs({ c }: { c: Chapitre }) {
  return (
    <div>
      <TitreEtape sous="Les pièges et mauvaises interprétations les plus courants.">Erreurs fréquentes</TitreEtape>
      <ul className="max-w-[68ch] space-y-3">
        {c.erreurs.map((e) => (
          <li key={e.titre} className="rounded-xl border-l-4 border-bad/60 bg-surface p-4">
            <p className="font-semibold text-ink">{typographie(e.titre)}</p>
            <p className="mt-1 text-[0.98rem] text-ink-2">
              <TexteRiche texte={e.texte} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EtapeResume({ c }: { c: Chapitre }) {
  return (
    <div>
      <TitreEtape>L&apos;essentiel</TitreEtape>
      <ol className="max-w-[68ch] space-y-3">
        {c.resume.map((r, i) => (
          <li key={r} className="flex gap-4 rounded-xl border border-line bg-surface p-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-sm text-brand">{i + 1}</span>
            <span className="text-[0.98rem] text-ink">
              <TexteRiche texte={r} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
