"use client";

import { useMemo, useRef, useState } from "react";
import type { Question } from "@/content/schema";
import { estComplete, melangeDeterministe, noter, noterQuiz, reponseVide, SEUIL_REUSSITE, type Reponse } from "@/lib/apprentissage/quiz";
import { enregistrerQuiz } from "@/lib/progression/store";
import { typographie } from "@/lib/typographie";
import { IconeCoche, IconeCroix } from "../ui/Icones";

const pct = (x: number) => `${Math.round(x * 100)} %`;

function Correction({ note, explication }: { note: number; explication: string }) {
  const juste = note >= 0.999;
  const partiel = !juste && note > 0;
  return (
    <div
      role="status"
      className={`apparition mt-4 rounded-xl border-l-4 p-4 ${juste ? "border-ok bg-ok/10" : partiel ? "border-warn bg-warn/10" : "border-bad bg-bad/10"}`}
    >
      <p className="font-semibold text-ink">{juste ? "Juste" : partiel ? `Partiellement juste (${pct(note)})` : "Pas tout à fait"}</p>
      <p className="mt-1 text-[0.95rem] text-ink">{typographie(explication)}</p>
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
    etat === "juste" ? "border-ok bg-ok/10" : etat === "faux" ? "border-bad bg-bad/10" : etat === "attendu" ? "border-ok/60" : coche ? "border-brand bg-brand-soft" : "border-line-strong hover:border-ink-3";
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${bord} ${desactive ? "cursor-default" : ""}`}>
      <input type={type} name={name} checked={coche} onChange={onChange} disabled={desactive} className="mt-1 size-4 shrink-0 accent-[var(--brand-solid)]" />
      <span className="flex-1 text-[0.98rem] text-ink">{children}</span>
      {etat === "juste" || etat === "attendu" ? <IconeCoche className="size-5 shrink-0 text-ok" /> : null}
      {etat === "faux" ? <IconeCroix className="size-5 shrink-0 text-bad" /> : null}
    </label>
  );
}

function ChampQuestion({
  q,
  r,
  setR,
  verifiee,
}: {
  q: Question;
  r: Reponse;
  setR: (r: Reponse) => void;
  verifiee: boolean;
}) {
  const droite = useMemo(() => (q.type === "association" ? melangeDeterministe(q.paires.length, `${q.id}-droite`) : []), [q]);

  if (q.type === "unique" && r.type === "unique") {
    return (
      <div className="space-y-2">
        {q.choix.map((c, i) => (
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
        {q.choix.map((c, i) => {
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

/** Quiz de chapitre : une question à la fois, correction immédiate, résultat enregistré par concept. */
export function Quiz({ slug, questions, nomsConcepts }: { slug: string; questions: Question[]; nomsConcepts: Record<string, string> }) {
  const [reponses, setReponses] = useState<Reponse[]>(() => questions.map(reponseVide));
  const [index, setIndex] = useState(0);
  const [verifiees, setVerifiees] = useState<boolean[]>(() => questions.map(() => false));
  const [fini, setFini] = useState(false);
  const enregistre = useRef(false);

  const q = questions[index];
  const resultat = useMemo(() => (fini ? noterQuiz(questions, reponses) : null), [fini, questions, reponses]);

  const terminer = () => {
    const r = noterQuiz(questions, reponses);
    if (!enregistre.current) {
      enregistrerQuiz(slug, r.score, r.parConcept, r.reussi);
      enregistre.current = true;
    }
    setFini(true);
  };

  const recommencer = () => {
    setReponses(questions.map(reponseVide));
    setVerifiees(questions.map(() => false));
    setIndex(0);
    setFini(false);
    enregistre.current = false;
  };

  if (fini && resultat) {
    return (
      <div className="not-prose space-y-5" aria-live="polite">
        <div className={`rounded-2xl border p-5 ${resultat.reussi ? "border-ok/50 bg-ok/10" : "border-warn/50 bg-warn/10"}`}>
          <p className="text-sm text-ink-2">Ton score</p>
          <p className="mt-1 font-mono text-4xl font-semibold text-ink tabular">{pct(resultat.score)}</p>
          <p className="mt-2 text-ink">
            {resultat.reussi
              ? "Chapitre validé. Tes résultats par concept sont enregistrés dans ton tableau de bord."
              : `Il faut ${pct(SEUIL_REUSSITE)} pour valider le chapitre. Revois les points ci-dessous, puis réessaie : les tentatives sont illimitées.`}
          </p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Par concept</p>
          <ul className="space-y-1.5">
            {resultat.parConcept.map((c) => (
              <li key={c.concept} className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2 text-sm">
                <span className="text-ink">{nomsConcepts[c.concept] ?? c.concept}</span>
                <span className={`font-mono tabular ${c.score >= 0.8 ? "text-ok" : c.score >= 0.5 ? "text-warn" : "text-bad"}`}>{pct(c.score)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={recommencer} className="rounded-lg border border-line-strong px-4 py-2.5 text-sm font-medium text-ink hover:border-ink-3">
            Recommencer le quiz
          </button>
          <a href="#etape-validation" className="rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-medium text-white hover:brightness-110">
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
      <div className="mb-4 flex items-center justify-between text-sm text-ink-3">
        <span>
          Question {index + 1} sur {questions.length}
        </span>
        <span className="flex gap-1" aria-hidden="true">
          {questions.map((_, i) => (
            <span key={i} className={`h-1.5 w-5 rounded-full ${i < index ? "bg-brand" : i === index ? "bg-brand/60" : "bg-line"}`} />
          ))}
        </span>
      </div>
      <fieldset key={q.id}>
        <legend className="mb-4 text-lg font-semibold leading-snug text-ink">{typographie(q.enonce)}</legend>
        <ChampQuestion
          q={q}
          r={reponses[index]}
          verifiee={verifiee}
          setR={(r) => setReponses((tout) => tout.map((x, i) => (i === index ? r : x)))}
        />
      </fieldset>
      {verifiee ? <Correction note={note} explication={q.explication} /> : null}
      <div className="mt-5 flex justify-end">
        {!verifiee ? (
          <button
            type="button"
            disabled={!estComplete(q, reponses[index])}
            onClick={() => setVerifiees((v) => v.map((x, i) => (i === index ? true : x)))}
            className="rounded-lg bg-brand-solid px-5 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Vérifier
          </button>
        ) : index < questions.length - 1 ? (
          <button type="button" onClick={() => setIndex(index + 1)} className="rounded-lg bg-brand-solid px-5 py-2.5 text-sm font-medium text-white hover:brightness-110">
            Question suivante
          </button>
        ) : (
          <button type="button" onClick={terminer} className="rounded-lg bg-brand-solid px-5 py-2.5 text-sm font-medium text-white hover:brightness-110">
            Voir mon résultat
          </button>
        )}
      </div>
    </div>
  );
}
