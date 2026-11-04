"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { conceptParId } from "@/content/concepts";
import type { Question } from "@/content/schema";
import { ajouterScenes } from "@/content/scenes";
import type { SceneFigure } from "@/lib/chartkit/types";
import { estComplete, reponseVide, type Reponse } from "@/lib/apprentissage/quiz";
import { useSession } from "@/lib/compte/session";
import { appeler, comptesDisponibles, fonctionsDisponibles } from "@/lib/firebase/client";
import { typographie } from "@/lib/typographie";
import { ChampQuestion, EnTeteQuestion } from "../chapitre/Quiz";
import { IconeCoche, IconeCroix } from "../ui/Icones";
import { Anneau, Jauge } from "../ui/Progression";

type Niveau = "connaissance" | "application" | "transfert";
type QuestionExamen = Question & { niveau: Niveau; chapitre: string };
type Config = { seuil: number; questions: number; parNiveau: Record<Niveau, number>; attenteMinutes: number };
type Etat = {
  config: Config;
  resultat: { meilleurScore: number; dernierScore: number; reussi: boolean; tentatives: number } | null;
  prochaineTentative: string | null;
  enCours: boolean;
};
type Copie = { questions: QuestionExamen[]; scenes: Record<string, SceneFigure>; titres: Record<string, string>; expire: string; config: Config };
type Resultat = {
  score: number;
  reussi: boolean;
  seuil: number;
  meilleurScore: number;
  tentatives: number;
  parNiveau: { niveau: Niveau; questions: number; score: number | null }[];
  parConcept: { concept: string; score: number }[];
  aRevoir: { slug: string; score: number; concepts: string[] }[];
  correction: { slug: string; id: string; niveau: Niveau; enonce: string; note: number; attendue: string; explication: string }[];
  titres: Record<string, string>;
};

const pct = (x: number) => `${Math.round(x * 100)} %`;
const nomConcept = (id: string) => conceptParId.get(id)?.nom ?? id;

const NIVEAUX: { id: Niveau; nom: string; sens: string }[] = [
  { id: "connaissance", nom: "Connaissance", sens: "définir, reconnaître, rappeler une règle" },
  { id: "application", nom: "Application", sens: "appliquer une méthode à un cas donné" },
  { id: "transfert", nom: "Transfert", sens: "raisonner sur une situation nouvelle" },
];
const nomNiveau = (n: Niveau) => NIVEAUX.find((x) => x.id === n)!.nom;

const nouvelleGraine = () => crypto.getRandomValues(new Uint32Array(1))[0];

/** Examen de fin de module : tiré, noté et enregistré par le serveur ; le navigateur ne reçoit jamais le corrigé avant la copie rendue. */
export function Examen({ module, titre }: { module: string; titre: string }) {
  const session = useSession(true);
  const [etat, setEtat] = useState<Etat | null>(null);
  const [erreur, setErreur] = useState<{ message: string; code?: string } | null>(null);
  const [copie, setCopie] = useState<Copie | null>(null);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const connecte = session.etat === "connecte";
  const charger = useCallback(() => {
    appeler<Etat>("examen", { action: "etat", module })
      .then((e) => {
        setErreur(null);
        setEtat(e);
      })
      .catch((e: Error & { code?: string }) => setErreur({ message: e.message, code: e.code }));
  }, [module]);
  useEffect(() => {
    if (connecte && fonctionsDisponibles) charger();
  }, [connecte, charger]);

  const commencer = () => {
    setEnvoi(true);
    setErreur(null);
    appeler<Copie>("examen", { action: "commencer", module })
      .then((c) => {
        ajouterScenes(c.scenes);
        setResultat(null);
        setCopie(c);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((e: Error & { code?: string }) => setErreur({ message: e.message, code: e.code }))
      .finally(() => setEnvoi(false));
  };

  const rendre = (reponses: Reponse[]) => {
    setEnvoi(true);
    setErreur(null);
    appeler<Resultat>("examen", { action: "rendre", module, reponses })
      .then((r) => {
        setResultat(r);
        setCopie(null);
        charger();
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((e: Error & { code?: string }) => setErreur({ message: e.message, code: e.code }))
      .finally(() => setEnvoi(false));
  };

  if (!fonctionsDisponibles) {
    return (
      <p className="carte p-6 text-ink-2">
        L&apos;examen de fin de module ouvre avec les résultats officiels, notés par le serveur de Méridien. En attendant, entraîne-toi avec les quiz de chaque
        chapitre.
      </p>
    );
  }
  if (comptesDisponibles && session.etat !== "connecte") {
    if (session.etat === "inconnu") return <div className="carte squelette h-40" aria-busy="true" />;
    const suite = encodeURIComponent(`/examen/${module}/`);
    return (
      <div className="carte p-6">
        <p className="text-lg font-semibold text-ink">Connecte-toi pour passer l&apos;examen</p>
        <p className="mt-2 text-ink-2">Ton résultat est enregistré sur ton compte.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/connexion/?suite=${suite}`} className="btn btn-primaire">
            Se connecter
          </Link>
          <Link href={`/inscription/?suite=${suite}`} className="btn btn-secondaire">
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  const bandeauErreur = erreur ? (
    <div role="alert" className="mb-5 border-l-2 border-bad bg-bad/10 px-4 py-3 text-sm text-ink">
      {erreur.message}
      {erreur.code === "permission-denied" ? (
        <>
          {" "}
          <Link href={`/formations/${module}/`} className="lien">
            Voir le module
          </Link>
        </>
      ) : null}
    </div>
  ) : null;

  if (copie) return <Copie copie={copie} envoi={envoi} erreur={bandeauErreur} onRendre={rendre} />;
  if (resultat) return <Bilan r={resultat} titre={titre} erreur={bandeauErreur} envoi={envoi} onRecommencer={commencer} />;
  if (!etat) return erreur ? bandeauErreur : <div className="carte squelette h-56" aria-busy="true" />;

  const { config, resultat: dernier } = etat;
  const attente = etat.prochaineTentative && new Date(etat.prochaineTentative) > new Date() ? new Date(etat.prochaineTentative) : null;
  return (
    <div className="space-y-8">
      {bandeauErreur}
      <section aria-labelledby="deroule">
        <h2 id="deroule" className="text-2xl text-ink">
          Déroulé
        </h2>
        <p className="mt-2 max-w-2xl text-ink-2">
          {config.questions} questions tirées dans les quiz de tous les chapitres du module, en trois niveaux. Tu valides avec {pct(config.seuil)}. Pas de
          correction pendant l&apos;examen : tu la reçois en entier quand tu rends ta copie. Une tentative reste ouverte trois heures.
        </p>
        <dl className="mt-6 grid border-y border-line-strong sm:grid-cols-3">
          {NIVEAUX.map((n, i) => (
            <div key={n.id} className={`py-4 sm:px-4 ${i ? "border-t border-line sm:border-l sm:border-t-0" : "sm:pl-0"}`}>
              <dt className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-ink">{n.nom}</span>
                <span className="font-mono text-sm text-ink-3 tabular">{config.parNiveau[n.id]} q.</span>
              </dt>
              <dd className="mt-1 text-sm text-ink-2">{typographie(n.sens)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {dernier ? (
        <section aria-labelledby="precedent" className="flex flex-wrap items-center gap-5">
          <Anneau valeur={dernier.meilleurScore} taille={72} epaisseur={6} libelle="Meilleur score" teinte={dernier.reussi ? "var(--ok)" : undefined}>
            <span className="font-mono text-sm font-semibold text-ink tabular">{pct(dernier.meilleurScore)}</span>
          </Anneau>
          <div>
            <h2 id="precedent" className="font-semibold text-ink">
              {dernier.reussi ? "Examen validé" : "Pas encore validé"}
            </h2>
            <p className="text-sm text-ink-2">
              Meilleur score {pct(dernier.meilleurScore)}, dernier {pct(dernier.dernierScore)}, {dernier.tentatives} tentative
              {dernier.tentatives > 1 ? "s" : ""}.
            </p>
          </div>
        </section>
      ) : null}

      <div>
        <button type="button" className="btn btn-primaire" onClick={commencer} disabled={envoi || Boolean(attente)}>
          {envoi ? "Préparation…" : etat.enCours ? "Reprendre avec une nouvelle variante" : dernier ? "Repasser l'examen" : "Commencer l'examen"}
        </button>
        {attente ? (
          <p className="mt-2 text-sm text-ink-2">
            Prochaine tentative possible le {attente.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })} : prends ce temps pour revoir les
            chapitres conseillés.
          </p>
        ) : dernier ? (
          <p className="mt-2 text-sm text-ink-3">Chaque tentative est une nouvelle variante : d&apos;autres questions, dans un autre ordre.</p>
        ) : null}
      </div>
    </div>
  );
}

function Copie({ copie, envoi, erreur, onRendre }: { copie: Copie; envoi: boolean; erreur: React.ReactNode; onRendre: (r: Reponse[]) => void }) {
  const { questions } = copie;
  const [graine] = useState(nouvelleGraine);
  const [reponses, setReponses] = useState<Reponse[]>(() => questions.map(reponseVide));
  const [index, setIndex] = useState(0);
  const [confirmer, setConfirmer] = useState(false);
  const q = questions[index];
  const sansReponse = questions.filter((x, i) => !estComplete(x, reponses[i])).length;

  // Quitter la page ferait perdre la copie en cours.
  useEffect(() => {
    const garde = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", garde);
    return () => window.removeEventListener("beforeunload", garde);
  }, []);

  return (
    <div>
      {erreur}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-ink-3">
          <span>
            Question {index + 1} sur {questions.length} · <span className="text-ink-2">{nomNiveau(q.niveau)}</span>
          </span>
          <span className="font-mono text-xs tabular">{questions.length - sansReponse} répondues</span>
        </div>
        <nav aria-label="Questions de l'examen" className="flex gap-1">
          {questions.map((x, i) => (
            <button
              key={x.chapitre + x.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Question ${i + 1}${estComplete(x, reponses[i]) ? ", répondue" : ""}`}
              aria-current={i === index ? "step" : undefined}
              className={`h-2 flex-1 rounded-full transition-colors ${i === index ? "bg-ink" : estComplete(x, reponses[i]) ? "bg-[var(--meridien)]" : "bg-line"}`}
            />
          ))}
        </nav>
      </div>
      <fieldset key={q.chapitre + q.id} className="etape-avant">
        <legend className="mb-5 text-lg font-semibold leading-snug text-ink sm:text-xl">{typographie(q.enonce)}</legend>
        <EnTeteQuestion q={q} />
        <ChampQuestion
          q={q}
          r={reponses[index]}
          verifiee={false}
          graine={graine}
          setR={(r) => setReponses((tout) => tout.map((x, i) => (i === index ? r : x)))}
        />
      </fieldset>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn btn-secondaire" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          Précédente
        </button>
        {index < questions.length - 1 ? (
          <button type="button" className="btn btn-primaire min-w-36" onClick={() => setIndex(index + 1)}>
            Suivante
          </button>
        ) : (
          <button type="button" className="btn btn-primaire min-w-36" onClick={() => (sansReponse ? setConfirmer(true) : onRendre(reponses))} disabled={envoi}>
            {envoi ? "Correction…" : "Rendre ma copie"}
          </button>
        )}
      </div>
      {confirmer && sansReponse ? (
        <div role="alertdialog" aria-labelledby="confirmer-titre" className="apparition mt-5 border-l-2 border-warn bg-warn/10 px-4 py-3">
          <p id="confirmer-titre" className="font-semibold text-ink">
            {sansReponse} question{sansReponse > 1 ? "s" : ""} sans réponse
          </p>
          <p className="mt-1 text-sm text-ink-2">Une question sans réponse compte zéro.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-secondaire"
              onClick={() => {
                setConfirmer(false);
                setIndex(questions.findIndex((x, i) => !estComplete(x, reponses[i])));
              }}
            >
              Y revenir
            </button>
            <button type="button" className="btn btn-primaire" onClick={() => onRendre(reponses)} disabled={envoi}>
              Rendre quand même
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Bilan({ r, titre, erreur, envoi, onRecommencer }: { r: Resultat; titre: string; erreur: React.ReactNode; envoi: boolean; onRecommencer: () => void }) {
  return (
    <div className="space-y-10" aria-live="polite">
      {erreur}
      <section
        className={`apparition carte flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:text-left ${r.reussi ? "!border-ok/40" : "!border-warn/40"}`}
      >
        <Anneau valeur={r.score} taille={112} epaisseur={9} libelle="Score de l'examen" teinte={r.reussi ? "var(--ok)" : "var(--warn)"}>
          <span className="font-mono text-2xl font-semibold text-ink tabular">{pct(r.score)}</span>
        </Anneau>
        <div>
          <p className="text-xl font-semibold text-ink">{r.reussi ? `Examen « ${titre} » validé` : "Pas encore validé"}</p>
          <p className="mt-2 text-ink-2">
            {r.reussi
              ? `Tu as dépassé le seuil de ${pct(r.seuil)}. Ton résultat est enregistré sur ton compte.`
              : `Il faut ${pct(r.seuil)} pour valider. Revois les chapitres conseillés ci-dessous, puis repasse une nouvelle variante.`}
          </p>
          <p className="mt-1 text-sm text-ink-3">
            Meilleur score {pct(r.meilleurScore)} · {r.tentatives} tentative{r.tentatives > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section aria-labelledby="niveaux">
        <h2 id="niveaux" className="text-xl text-ink">
          Par niveau
        </h2>
        <ul className="mt-4 space-y-4">
          {r.parNiveau.map((n) => (
            <li key={n.niveau}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink">
                  <span className="font-semibold">{nomNiveau(n.niveau)}</span>{" "}
                  <span className="text-ink-3">· {NIVEAUX.find((x) => x.id === n.niveau)!.sens}</span>
                </span>
                <span className="font-mono tabular text-ink-2">{n.score === null ? "—" : pct(n.score)}</span>
              </div>
              <Jauge valeur={n.score ?? 0} libelle={`Score en ${nomNiveau(n.niveau)}`} />
            </li>
          ))}
        </ul>
      </section>

      {r.aRevoir.length ? (
        <section aria-labelledby="revoir">
          <h2 id="revoir" className="text-xl text-ink">
            À revoir en priorité
          </h2>
          <ol className="mt-4 divide-y divide-line border-y border-line">
            {r.aRevoir.map((c) => (
              <li key={c.slug} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                <Link href={`/chapitre/${c.slug}/`} className="lien font-semibold">
                  {typographie(r.titres[c.slug] ?? c.slug)}
                </Link>
                <span className="font-mono text-sm text-ink-3 tabular">{pct(c.score)}</span>
                {c.concepts.length ? <p className="w-full text-sm text-ink-2">{c.concepts.map(nomConcept).join(" · ")}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="competences">
        <h2 id="competences" className="text-xl text-ink">
          Compétences
        </h2>
        <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {r.parConcept.map((c) => (
            <li key={c.concept}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span className="text-ink">{nomConcept(c.concept)}</span>
                <span className={`font-mono tabular ${c.score >= 0.8 ? "text-ok" : c.score >= 0.5 ? "text-warn" : "text-bad"}`}>{pct(c.score)}</span>
              </div>
              <Jauge valeur={c.score} libelle={`Score sur ${nomConcept(c.concept)}`} className="!h-1.5" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="correction">
        <h2 id="correction" className="text-xl text-ink">
          Correction détaillée
        </h2>
        <ol className="mt-4 space-y-3">
          {r.correction.map((c, i) => {
            const juste = c.note >= 0.999;
            return (
              <li key={c.slug + c.id}>
                <details className="depliant carte p-4">
                  <summary className="flex cursor-pointer items-start gap-3">
                    <span
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${juste ? "bg-ok text-bg" : c.note > 0 ? "bg-warn text-bg" : "bg-bad text-white"}`}
                    >
                      {juste ? <IconeCoche className="size-3.5" /> : <IconeCroix className="size-3.5" />}
                      <span className="sr-only">{juste ? "Juste" : c.note > 0 ? `Partiellement juste, ${pct(c.note)}` : "Faux"}</span>
                    </span>
                    <span className="flex-1">
                      <span className="block text-xs text-ink-3">
                        {i + 1}. {nomNiveau(c.niveau)} · {typographie(r.titres[c.slug] ?? c.slug)}
                      </span>
                      <span className="text-ink">{typographie(c.enonce)}</span>
                    </span>
                  </summary>
                  <div className="mt-3 border-t border-line pt-3 text-sm">
                    <p className="text-ink">
                      <span className="font-semibold">Réponse attendue :</span> {typographie(c.attendue)}
                    </p>
                    <p className="mt-2 text-ink-2">{typographie(c.explication)}</p>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-primaire" onClick={onRecommencer} disabled={envoi}>
          {envoi ? "Préparation…" : "Repasser une nouvelle variante"}
        </button>
      </div>
    </div>
  );
}
