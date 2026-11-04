"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Question, VisuelQuestion } from "@/content/schema";
import {
  estComplete,
  melangeDeterministe,
  noter,
  noterQuiz,
  ordreAffichage,
  reponseVide,
  SEUIL_REUSSITE,
  tirerQuestions,
  TIRAGE_PAR_DEFAUT,
  type Reponse,
} from "@/lib/apprentissage/quiz";
import { enregistrerQuiz } from "@/lib/progression/store";
import { useSession } from "@/lib/compte/session";
import { appeler, comptesDisponibles, fonctionsDisponibles } from "@/lib/firebase/client";
import Link from "next/link";
import { typographie } from "@/lib/typographie";
import { Visuel } from "../figures/Figure";
import { SelecteurBougies } from "../figures/SelecteurBougies";
import { IconeCoche, IconeCroix } from "../ui/Icones";
import { Anneau, Jauge } from "../ui/Progression";

const pct = (x: number) => `${Math.round(x * 100)} %`;

function Correction({ note, explication }: { note: number; explication: string }) {
  const juste = note >= 0.999;
  const partiel = !juste && note > 0;
  return (
    <div
      role="status"
      className={`apparition mt-5 flex gap-3 rounded-2xl border p-4 ${juste ? "border-ok/40 bg-ok/10" : partiel ? "border-warn/40 bg-warn/10" : "border-bad/40 bg-bad/10"}`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${juste ? "bg-ok text-bg" : partiel ? "bg-warn text-bg" : "bg-bad text-white"}`}
        aria-hidden="true"
      >
        {juste ? <IconeCoche className="size-4" /> : <IconeCroix className="size-4" />}
      </span>
      <div>
        <p className="font-semibold text-ink">{juste ? "Juste" : partiel ? `Partiellement juste (${pct(note)})` : "Pas tout à fait"}</p>
        <p className="mt-1 text-[0.95rem] leading-relaxed text-ink">{typographie(explication)}</p>
      </div>
    </div>
  );
}

function Option({
  type,
  name,
  coche,
  onChange,
  desactive,
  etat,
  children,
}: {
  type: "radio" | "checkbox";
  name: string;
  coche: boolean;
  onChange: () => void;
  desactive: boolean;
  etat?: "juste" | "faux" | "attendu";
  children: React.ReactNode;
}) {
  const bord =
    etat === "juste"
      ? "border-ok bg-ok/10"
      : etat === "faux"
        ? "border-bad bg-bad/10"
        : etat === "attendu"
          ? "border-ok/60 bg-ok/[0.04]"
          : coche
            ? "border-brand bg-brand-soft shadow-[0_0_0_3px_rgb(143_132_255/0.15)]"
            : "border-line-strong bg-surface/60 hover:border-ink-3 hover:bg-surface-2";
  return (
    <label
      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-[0.99] ${bord} ${desactive ? "cursor-default active:scale-100" : ""}`}
    >
      <input type={type} name={name} checked={coche} onChange={onChange} disabled={desactive} className="size-[1.1rem] shrink-0 accent-[var(--brand-solid)]" />
      <span className="flex-1 text-[0.98rem] leading-snug text-ink">{children}</span>
      {etat === "juste" || etat === "attendu" ? <IconeCoche className="size-5 shrink-0 text-ok" /> : null}
      {etat === "faux" ? <IconeCroix className="size-5 shrink-0 text-bad" /> : null}
    </label>
  );
}

/** Graphique d'une question (figure, ou l'un des deux graphiques d'une comparaison). */
function GraphiqueQuestion({ v }: { v: VisuelQuestion }) {
  return (
    <figure>
      <Visuel scene={v.scene} etape={v.etape} />
      {v.legende ? <figcaption className="mt-2 text-sm text-ink-2">{typographie(v.legende)}</figcaption> : null}
    </figure>
  );
}

/** Ce qui précède les réponses : situation de marché (étude de cas) et graphique à lire. */
export function EnTeteQuestion({ q }: { q: Question }) {
  if (!q.contexte && !q.figure) return null;
  return (
    <div className="mb-5 space-y-3">
      {q.contexte ? (
        <div className="rounded-2xl border border-cyan/30 bg-cyan/5 p-4 text-[0.95rem] leading-relaxed text-ink">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan">Situation</p>
          {typographie(q.contexte)}
        </div>
      ) : null}
      {q.figure ? (
        <div className="carte p-3 sm:p-4">
          <GraphiqueQuestion v={q.figure} />
        </div>
      ) : null}
    </div>
  );
}

export function ChampQuestion({ q, r, setR, verifiee, graine }: { q: Question; r: Reponse; setR: (r: Reponse) => void; verifiee: boolean; graine: number }) {
  const droite = useMemo(() => (q.type === "association" ? melangeDeterministe(q.paires.length, `${q.id}-droite`) : []), [q]);
  // Les choix changent d'ordre à chaque tentative ; la réponse garde les index d'origine.
  const ordre = useMemo(() => (q.type === "unique" || q.type === "multiple" ? ordreAffichage(q.choix.length, graine, q.id) : []), [q, graine]);

  if (q.type === "graphique" && r.type === "graphique") {
    return (
      <div className="carte p-3 sm:p-4">
        <SelecteurBougies
          scene={q.scene}
          etape={q.etape}
          choix={r.choix}
          onChange={(choix) => setR({ type: "graphique", choix })}
          desactive={verifiee}
          bonnes={verifiee ? q.bonnes : undefined}
        />
      </div>
    );
  }
  if (q.type === "comparaison" && r.type === "comparaison") {
    return (
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Choisis le graphique A ou B">
        {q.graphiques.map((g, i) => {
          const choisi = r.choix === i;
          const etat = verifiee ? (i === q.bonne ? (choisi ? "juste" : "attendu") : choisi ? "faux" : undefined) : undefined;
          const bord =
            etat === "juste"
              ? "border-ok bg-ok/10"
              : etat === "faux"
                ? "border-bad bg-bad/10"
                : etat === "attendu"
                  ? "border-ok/60"
                  : choisi
                    ? "border-brand bg-brand-soft"
                    : "border-line-strong hover:border-ink-3";
          return (
            <label key={i} className={`block cursor-pointer rounded-2xl border p-3 transition-colors ${bord} ${verifiee ? "cursor-default" : ""}`}>
              <span className="mb-2 flex items-center gap-2 font-semibold text-ink">
                <input
                  type="radio"
                  name={q.id}
                  checked={choisi}
                  disabled={verifiee}
                  onChange={() => setR({ type: "comparaison", choix: i as 0 | 1 })}
                  className="size-[1.1rem] accent-[var(--brand-solid)]"
                />
                Graphique {i === 0 ? "A" : "B"}
                {etat === "juste" || etat === "attendu" ? <IconeCoche className="ml-auto size-5 text-ok" /> : null}
                {etat === "faux" ? <IconeCroix className="ml-auto size-5 text-bad" /> : null}
              </span>
              <GraphiqueQuestion v={g} />
            </label>
          );
        })}
      </div>
    );
  }

  if (q.type === "unique" && r.type === "unique") {
    return (
      <div className="space-y-2">
        {ordre
          .map((i) => [q.choix[i], i] as const)
          .map(([c, i]) => (
            <Option
              key={i}
              type="radio"
              name={q.id}
              coche={r.choix === i}
              onChange={() => setR({ type: "unique", choix: i })}
              desactive={verifiee}
              etat={verifiee ? (i === q.bonne ? (r.choix === i ? "juste" : "attendu") : r.choix === i ? "faux" : undefined) : undefined}
            >
              {typographie(c)}
            </Option>
          ))}
      </div>
    );
  }
  if (q.type === "vraifaux" && r.type === "vraifaux") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[true, false].map((v) => (
          <Option
            key={String(v)}
            type="radio"
            name={q.id}
            coche={r.valeur === v}
            onChange={() => setR({ type: "vraifaux", valeur: v })}
            desactive={verifiee}
            etat={verifiee ? (v === q.reponse ? (r.valeur === v ? "juste" : "attendu") : r.valeur === v ? "faux" : undefined) : undefined}
          >
            {v ? "Vrai" : "Faux"}
          </Option>
        ))}
      </div>
    );
  }
  if (q.type === "multiple" && r.type === "multiple") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-ink-3">Plusieurs réponses possibles.</p>
        {ordre
          .map((i) => [q.choix[i], i] as const)
          .map(([c, i]) => {
            const coche = r.choix.includes(i);
            const attendue = q.bonnes.includes(i);
            return (
              <Option
                key={i}
                type="checkbox"
                name={`${q.id}-${i}`}
                coche={coche}
                onChange={() => setR({ type: "multiple", choix: coche ? r.choix.filter((x) => x !== i) : [...r.choix, i] })}
                desactive={verifiee}
                etat={verifiee ? (attendue ? (coche ? "juste" : "attendu") : coche ? "faux" : undefined) : undefined}
              >
                {typographie(c)}
              </Option>
            );
          })}
      </div>
    );
  }
  if (q.type === "association" && r.type === "association") {
    return (
      <div className="space-y-3">
        {q.paires.map(([gauche], i) => {
          const choisi = r.choix[i];
          const juste = verifiee && choisi === i;
          return (
            <div key={i} className="grid gap-2 sm:grid-cols-2 sm:items-center">
              <label htmlFor={`${q.id}-${i}`} className="text-[0.98rem] font-medium text-ink">
                {typographie(gauche)}
              </label>
              <div>
                <select
                  id={`${q.id}-${i}`}
                  value={choisi}
                  disabled={verifiee}
                  onChange={(e) => {
                    const choix = [...r.choix];
                    choix[i] = Number(e.target.value);
                    setR({ type: "association", choix });
                  }}
                  className={`w-full rounded-lg border bg-bg px-3 py-2.5 text-[0.95rem] text-ink ${
                    verifiee ? (juste ? "border-ok" : "border-bad") : "border-line-strong"
                  }`}
                >
                  <option value={-1}>Choisir…</option>
                  {droite.map((d) => (
                    <option key={d} value={d}>
                      {q.paires[d][1]}
                    </option>
                  ))}
                </select>
                {verifiee && !juste ? <p className="mt-1 text-sm text-ok">Réponse attendue : {typographie(q.paires[i][1])}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  if (q.type === "ordre" && r.type === "ordre") {
    const deplacer = (position: number, sens: -1 | 1) => {
      const ordre = [...r.ordre];
      const cible = position + sens;
      [ordre[position], ordre[cible]] = [ordre[cible], ordre[position]];
      setR({ type: "ordre", ordre });
    };
    return (
      <ol className="space-y-2">
        {r.ordre.map((origine, position) => {
          const juste = verifiee && origine === position;
          return (
            <li
              key={origine}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                verifiee ? (juste ? "border-ok bg-ok/10" : "border-bad bg-bad/10") : "border-line-strong"
              }`}
            >
              <span className="w-6 text-center font-mono text-sm text-ink-3">{position + 1}</span>
              <span className="flex-1 text-[0.98rem] text-ink">
                {typographie(q.etapes[origine])}
                {verifiee && !juste ? <span className="ml-2 text-sm text-ok">(position attendue : {origine + 1})</span> : null}
              </span>
              {!verifiee ? (
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => deplacer(position, -1)}
                    disabled={position === 0}
                    aria-label={`Monter « ${q.etapes[origine]} »`}
                    className="rounded-md border border-line px-2 py-1 text-ink-2 hover:text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => deplacer(position, 1)}
                    disabled={position === r.ordre.length - 1}
                    aria-label={`Descendre « ${q.etapes[origine]} »`}
                    className="rounded-md border border-line px-2 py-1 text-ink-2 hover:text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    );
  }
  return null;
}

/** Sans compte, le quiz est présenté mais pas ouvert : il faut un compte (gratuit) pour enregistrer un résultat. */
function PorteQuiz({ slug, chargement }: { slug: string; chargement: boolean }) {
  const suite = encodeURIComponent(`/chapitre/${slug}/#etape-quiz`);
  if (chargement) return <div className="carte h-40 animate-pulse" aria-busy="true" />;
  return (
    <div className="carte p-6 text-center">
      <p className="text-lg font-semibold text-ink">Crée ton compte gratuit pour passer le quiz</p>
      <p className="mx-auto mt-2 max-w-md text-ink-2">
        Le cours reste ouvert à tous. Avec un compte, ton résultat est enregistré, ta progression te suit sur tous tes appareils et les quiz réussis mènent au
        certificat du module. Ce que tu as déjà fait sur cet appareil y sera repris.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Link href={`/inscription/?suite=${suite}`} className="btn btn-primaire">
          Créer un compte
        </Link>
        <Link href={`/connexion/?suite=${suite}`} className="btn btn-secondaire">
          Se connecter
        </Link>
      </div>
    </div>
  );
}

const sAbonnerRien = () => () => {};
const nouvelleGraine = () => crypto.getRandomValues(new Uint32Array(1))[0];

/**
 * Quiz de chapitre. Chaque tentative tire ses questions dans la banque du chapitre (questions visuelles
 * comprises), mélange l'ordre des réponses, corrige immédiatement et enregistre le résultat par concept.
 */
export function Quiz({
  slug,
  questions: banque,
  tirage = TIRAGE_PAR_DEFAUT,
  nomsConcepts,
}: {
  slug: string;
  questions: Question[];
  tirage?: number;
  nomsConcepts: Record<string, string>;
}) {
  const session = useSession(true);
  // Le tirage est aléatoire : rien n'est rendu côté serveur, pour que l'hydratation reste exacte.
  const monte = useSyncExternalStore(
    sAbonnerRien,
    () => true,
    () => false,
  );
  const [graine, setGraine] = useState(nouvelleGraine);
  const questions = useMemo(() => tirerQuestions(banque, Math.min(tirage, banque.length), graine), [banque, tirage, graine]);

  // Tant que les comptes ne sont pas ouverts, le quiz reste utilisable sur l'appareil (résultat non officiel).
  if (comptesDisponibles && session.etat !== "connecte") return <PorteQuiz slug={slug} chargement={session.etat === "inconnu"} />;
  if (!monte) return <div className="carte h-40 animate-pulse" aria-busy="true" />;
  return (
    <Tentative
      key={graine}
      slug={slug}
      questions={questions}
      taille={banque.length}
      graine={graine}
      nomsConcepts={nomsConcepts}
      connecte={session.etat === "connecte"}
      onRecommencer={() => setGraine(nouvelleGraine())}
    />
  );
}

function Tentative({
  slug,
  questions,
  taille,
  graine,
  nomsConcepts,
  connecte,
  onRecommencer,
}: {
  slug: string;
  questions: Question[];
  taille: number;
  graine: number;
  nomsConcepts: Record<string, string>;
  connecte: boolean;
  onRecommencer: () => void;
}) {
  const [officiel, setOfficiel] = useState<{ statut: "envoi" | "ok" | "erreur"; message?: string; certificat?: string | null } | null>(null);
  const [reponses, setReponses] = useState<Reponse[]>(() => questions.map(reponseVide));
  const [index, setIndex] = useState(0);
  const [verifiees, setVerifiees] = useState<boolean[]>(() => questions.map(() => false));
  const [fini, setFini] = useState(false);
  const enregistre = useRef(false);

  const q = questions[index];
  const resultat = useMemo(() => (fini ? noterQuiz(questions, reponses) : null), [fini, questions, reponses]);

  /** Résultat officiel : recalculé par le serveur à partir du corrigé qu'il détient, puis enregistré sur le compte. */
  const envoyerOfficiel = () => {
    setOfficiel({ statut: "envoi" });
    appeler<{ reussi: boolean; certificat: string | null }>("noterQuiz", { slug, ids: questions.map((x) => x.id), reponses })
      .then((r) => setOfficiel({ statut: "ok", certificat: r.certificat }))
      .catch((e) => setOfficiel({ statut: "erreur", message: (e as Error).message }));
  };

  const terminer = () => {
    const r = noterQuiz(questions, reponses);
    if (!enregistre.current) {
      enregistrerQuiz(slug, r.score, r.parConcept, r.reussi);
      enregistre.current = true;
      if (connecte && fonctionsDisponibles) envoyerOfficiel();
    }
    setFini(true);
  };

  // Nouvelle tentative : nouveau tirage dans la banque, réponses remises à zéro (le composant est recréé).
  const recommencer = onRecommencer;

  if (fini && resultat) {
    return (
      <div className="not-prose space-y-6" aria-live="polite">
        <div
          className={`apparition carte relative flex flex-col items-center gap-5 overflow-hidden p-6 text-center sm:flex-row sm:text-left ${resultat.reussi ? "!border-ok/40" : "!border-warn/40"}`}
        >
          <span className="relative">
            <Anneau valeur={resultat.score} taille={112} epaisseur={9} libelle="Ton score" teinte={resultat.reussi ? "var(--ok)" : "var(--warn)"}>
              <span className="font-mono text-2xl font-semibold text-ink tabular">{pct(resultat.score)}</span>
            </Anneau>
          </span>
          <div>
            <p className="text-sm text-ink-2">Ton score</p>
            <p className="mt-1 text-xl font-semibold text-ink">{resultat.reussi ? "Bravo, c'est validé !" : "Encore un effort"}</p>
            <p className="mt-2 text-ink-2">
              {resultat.reussi
                ? "Chapitre validé. Tes résultats par concept sont enregistrés dans ton tableau de bord."
                : `Il faut ${pct(SEUIL_REUSSITE)} pour valider le chapitre. Revois les points ci-dessous, puis réessaie : les tentatives sont illimitées.`}
            </p>
          </div>
        </div>
        {connecte && !fonctionsDisponibles ? (
          <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm" role="status">
            Résultat enregistré dans ta progression, sur ton compte. Les résultats officiels et les certificats arrivent bientôt.
          </p>
        ) : null}
        {officiel ? (
          <p
            className={`rounded-xl border px-4 py-3 text-sm ${officiel.statut === "erreur" ? "border-warn/50 bg-warn/10" : "border-line bg-surface"}`}
            role="status"
          >
            {officiel.statut === "envoi" ? "Enregistrement du résultat officiel sur ton compte…" : null}
            {officiel.statut === "ok" ? (
              <>
                Résultat officiel enregistré sur ton compte.
                {officiel.certificat ? (
                  <>
                    {" "}
                    Module terminé : ton certificat <span className="font-mono text-ink">{officiel.certificat}</span> est dans{" "}
                    <Link href="/compte/#certificats" className="text-brand underline">
                      Mon compte
                    </Link>
                    .
                  </>
                ) : null}
              </>
            ) : null}
            {officiel.statut === "erreur" ? (
              <>
                Résultat gardé sur cet appareil, mais pas encore enregistré sur ton compte : {officiel.message}{" "}
                <button type="button" className="font-semibold text-brand underline" onClick={envoyerOfficiel}>
                  Réessayer
                </button>
              </>
            ) : null}
          </p>
        ) : null}
        <div>
          <p className="mb-3 text-sm font-semibold text-ink">Par concept</p>
          <ul className="space-y-2.5">
            {resultat.parConcept.map((c, i) => (
              <li key={c.concept} className="revele rounded-xl bg-surface px-4 py-3 text-sm" style={{ ["--i" as string]: i }}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-ink">{nomsConcepts[c.concept] ?? c.concept}</span>
                  <span className={`font-mono tabular ${c.score >= 0.8 ? "text-ok" : c.score >= 0.5 ? "text-warn" : "text-bad"}`}>{pct(c.score)}</span>
                </div>
                <Jauge valeur={c.score} libelle={`Score sur ${nomsConcepts[c.concept] ?? c.concept}`} className="!h-1.5" />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={recommencer} className="btn btn-secondaire">
            Recommencer le quiz
          </button>
          <a href="#etape-validation" className="btn btn-primaire">
            Voir la validation du chapitre
          </a>
        </div>
      </div>
    );
  }

  const verifiee = verifiees[index];
  const note = verifiee ? noter(q, reponses[index]) : 0;
  return (
    <div className="not-prose">
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm text-ink-3">
          <span>
            Question {index + 1} sur {questions.length}
            {taille > questions.length ? <span className="text-ink-3"> · tirée d&apos;une banque de {taille}</span> : null}
          </span>
          <span className="font-mono text-xs">{Math.round((index / questions.length) * 100)} %</span>
        </div>
        <span className="flex gap-1" aria-hidden="true">
          {questions.map((_, i) => (
            <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-soft)]"
                style={{ width: i < index || (i === index && verifiee) ? "100%" : i === index ? "35%" : "0%", background: "var(--meridien)" }}
              />
            </span>
          ))}
        </span>
      </div>
      <fieldset key={q.id} data-question={q.id} className="apparition">
        <legend className="mb-5 text-lg font-semibold leading-snug text-ink sm:text-xl">{typographie(q.enonce)}</legend>
        <EnTeteQuestion q={q} />
        <ChampQuestion
          graine={graine}
          q={q}
          r={reponses[index]}
          verifiee={verifiee}
          setR={(r) => setReponses((tout) => tout.map((x, i) => (i === index ? r : x)))}
        />
      </fieldset>
      {verifiee ? <Correction note={note} explication={q.explication} /> : null}
      <div className="mt-6 flex justify-end">
        {!verifiee ? (
          <button
            type="button"
            disabled={!estComplete(q, reponses[index])}
            onClick={() => setVerifiees((v) => v.map((x, i) => (i === index ? true : x)))}
            className="btn btn-primaire min-w-36"
          >
            Vérifier
          </button>
        ) : index < questions.length - 1 ? (
          <button type="button" onClick={() => setIndex(index + 1)} className="btn btn-primaire min-w-36">
            Question suivante
          </button>
        ) : (
          <button type="button" onClick={terminer} className="btn btn-primaire min-w-36">
            Voir mon résultat
          </button>
        )}
      </div>
    </div>
  );
}
