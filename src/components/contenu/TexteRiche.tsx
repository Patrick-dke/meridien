import { termeParSlug } from "@/content/glossaire";
import { decouper, typographie } from "@/lib/typographie";
import { TermeGlossaire } from "../glossaire/TermeGlossaire";

/** Texte de cours avec gras, termes du glossaire cliquables et typographie française. */
export function TexteRiche({ texte }: { texte: string }) {
  return (
    <>
      {decouper(texte).map((s, i) => {
        if (s.type === "texte") return typographie(s.valeur);
        if (s.type === "gras") return <strong key={i}>{typographie(s.valeur)}</strong>;
        const t = termeParSlug.get(s.slug);
        if (!t) throw new Error(`Terme absent du glossaire : ${s.slug}`);
        return (
          <TermeGlossaire key={i} slug={t.slug} terme={t.terme} court={t.court}>
            {typographie(s.valeur || t.terme.toLowerCase())}
          </TermeGlossaire>
        );
      })}
    </>
  );
}
