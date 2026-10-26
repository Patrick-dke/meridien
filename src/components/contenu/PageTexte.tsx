import { typographie } from "@/lib/typographie";

/** Page de texte simple (pages légales) : titre, date de mise à jour, sections. */
export function PageTexte({ titre, maj, sections }: { titre: string; maj: string; sections: { titre: string; paragraphes: string[] }[] }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{typographie(titre)}</h1>
      <p className="mt-2 text-sm text-ink-3">Mise à jour : {maj}</p>
      <div className="mt-8 space-y-8">
        {sections.map((s) => (
          <section key={s.titre}>
            <h2 className="mb-3 text-xl font-semibold text-ink">{typographie(s.titre)}</h2>
            <div className="prose-cours text-ink-2">
              {s.paragraphes.map((p) => (
                <p key={p}>{typographie(p)}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
