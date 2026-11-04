import { conceptParId } from "@/content/concepts";
import { capsules } from "@/content/verifier";
import { TIRAGE_PAR_DEFAUT } from "@/lib/apprentissage/quiz";
import type { Chapitre } from "@/content/schema";
import type { Narration } from "@/lib/narration";
import { typographie } from "@/lib/typographie";
import { RenduBlocs } from "../contenu/Blocs";
import { Capsule } from "./Capsule";
import { EtapeCours, EtapeErreurs, EtapeIntroduction, EtapeResume, TitreEtape } from "./Etapes";
import { Exercices } from "./Exercices";
import type { Etape } from "./LecteurChapitre";
import { Quiz } from "./Quiz";
import { Validation } from "./Validation";

/** Présentation du quiz : taille de la série, banque dont elle est tirée, seuil de validation. */
function quizSous(c: Chapitre) {
  const n = Math.min(c.tirage ?? TIRAGE_PAR_DEFAUT, c.quiz.length);
  const banque = c.quiz.length > n ? `, tirées au hasard parmi ${c.quiz.length} (elles changent à chaque tentative)` : "";
  return `${n} questions${banque}, correction immédiate. 80 % de bonnes réponses valident le chapitre.`;
}

/**
 * Les étapes d'un chapitre, dans l'ordre du cahier : introduction et objectifs, capsule, cours, illustrations,
 * exemple, erreurs, résumé, exercices, quiz, validation. Partagé par les chapitres gratuits (rendus au build)
 * et les chapitres payants (rendus dans le navigateur une fois le contenu servi par la base).
 */
export function construireEtapes({ c, narrations, suivant }: { c: Chapitre; narrations: (Narration | null)[]; suivant: { slug: string; titre: string } | null }): Etape[] {
  const toutes = capsules(c);
  const concepts = [...new Set([...c.concepts, ...c.quiz.flatMap((q) => q.concepts)])];
  const nomsConcepts = Object.fromEntries(concepts.map((id) => [id, conceptParId.get(id)?.nom ?? id]));
  return [
    { id: "introduction", libelle: "Introduction", contenu: <EtapeIntroduction c={c} /> },
    {
      id: "capsule",
      libelle: "Capsule",
      contenu: (
        <div className="max-w-3xl">
          <TitreEtape
            surtitre={toutes.length > 1 ? `Capsules · ${toutes.length}` : "Capsule"}
            sous={toutes.length > 1 ? "Le sujet en plusieurs capsules de 90 secondes au plus : écoute-les dans l'ordre, puis passe au cours." : "L'essentiel du chapitre en moins de 90 secondes : écoute, regarde, puis passe au cours."}
          >
            {c.capsule.titre}
          </TitreEtape>
          <div className="space-y-10">
            {toutes.map((k, i) => (
              <section key={i} aria-label={`Capsule ${i + 1} : ${k.titre}`}>
                {i > 0 ? <h3 className="mb-3 text-lg font-semibold text-ink">{`${i + 1}. ${typographie(k.titre)}`}</h3> : null}
                <Capsule titre={k.titre} scenes={k.scenes} narration={narrations[i] ?? null} />
              </section>
            ))}
          </div>
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
      id: "exercices",
      libelle: "Exercices",
      contenu: (
        <div className="max-w-2xl">
          <TitreEtape sous="Mets le cours en pratique : correction immédiate, sans note. Le quiz qui suit valide le chapitre.">Exercices</TitreEtape>
          <Exercices exercices={c.exercices} />
        </div>
      ),
    },
    {
      id: "quiz",
      libelle: "Quiz",
      contenu: (
        <div className="max-w-2xl">
          <TitreEtape sous={quizSous(c)}>Quiz</TitreEtape>
          <Quiz slug={c.slug} questions={c.quiz} tirage={c.tirage} nomsConcepts={nomsConcepts} />
        </div>
      ),
    },
    {
      id: "validation",
      libelle: "Validation",
      contenu: (
        <div className="max-w-2xl">
          <TitreEtape>Validation</TitreEtape>
          <Validation slug={c.slug} concepts={c.concepts.map((id) => ({ id, nom: nomsConcepts[id] }))} suivant={suivant} />
        </div>
      ),
    },
  ];
}
