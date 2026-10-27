"use client";

import { useId, useRef, useState } from "react";
import { scenes } from "@/content/scenes";
import type { Exercice } from "@/content/schema";
import { formatPrix } from "@/lib/chartkit/outils";
import { typographie } from "@/lib/typographie";
import { TexteRiche } from "../contenu/TexteRiche";
import { DROITE, GAUCHE, GraphiqueBougies, L } from "../figures/GraphiqueBougies";
import { IconeCoche, IconeCroix } from "../ui/Icones";

type Verdict = "juste" | "faux" | null;

/** « 1 234,5 » ou « -50 » → nombre ; null si la saisie n'en est pas un. */
export function lireNombre(saisie: string): number | null {
  const propre = saisie.replace(/[\s  ]/g, "").replace(/[−–]/g, "-").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(propre)) return null;
  return Number(propre);
}

export const calculJuste = (e: Extract<Exercice, { type: "calcul" }>, x: number) => Math.abs(x - e.reponse) <= e.tolerance + 1e-9;

function Corrige({ e, verdict }: { e: Exercice; verdict: Verdict }) {
  return (
    <div className={`mt-4 rounded-xl border p-4 text-sm leading-relaxed ${verdict === "juste" ? "border-ok/50 bg-ok/10" : verdict === "faux" ? "border-warn/50 bg-warn/10" : "border-line bg-surface"}`} role="status">
      {verdict ? (
        <p className={`mb-1.5 flex items-center gap-1.5 font-semibold ${verdict === "juste" ? "text-ok" : "text-warn"}`}>
          {verdict === "juste" ? <IconeCoche className="size-4" /> : <IconeCroix className="size-4" />}
          {verdict === "juste" ? "Juste." : "Pas encore."}
        </p>
      ) : (
        <p className="mb-1.5 font-semibold text-ink">Corrigé</p>
      )}
      <p className="text-ink-2">
        <TexteRiche texte={e.corrige} />
      </p>
    </div>
  );
}

function Calcul({ e }: { e: Extract<Exercice, { type: "calcul" }> }) {
  const id = useId();
  const [saisie, setSaisie] = useState("");
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [aide, setAide] = useState(false);
  const verifier = (ev: React.FormEvent) => {
    ev.preventDefault();
    const x = lireNombre(saisie);
    if (x === null) return setErreur("Écris un nombre, par exemple 12,5 ou -50.");
    setErreur(null);
    setVerdict(calculJuste(e, x) ? "juste" : "faux");
  };
  return (
    <form onSubmit={verifier}>
      <label htmlFor={id} className="etiquette">
        Ta réponse{e.unite ? ` (${e.unite})` : ""}
      </label>
      <div className="flex flex-wrap gap-2">
        <input id={id} className="champ max-w-[12rem]" inputMode="decimal" autoComplete="off" value={saisie} onChange={(x) => setSaisie(x.target.value)} aria-invalid={erreur ? true : undefined} />
        <button type="submit" className="btn btn-primaire">
          Vérifier
        </button>
        {e.aide && !aide ? (
          <button type="button" className="btn btn-discret" onClick={() => setAide(true)}>
            Un indice
          </button>
        ) : null}
      </div>
      {erreur ? <p className="mt-1.5 text-sm text-bad">{erreur}</p> : null}
      {aide && e.aide ? <p className="mt-3 rounded-lg bg-surface-2/70 px-3 py-2 text-sm text-ink-2">{typographie(e.aide)}</p> : null}
      {verdict ? <Corrige e={e} verdict={verdict} /> : null}
    </form>
  );
}

function Graphique({ e }: { e: Extract<Exercice, { type: "graphique" }> }) {
  const s = scenes[e.scene];
  const cadre = useRef<HTMLDivElement>(null);
  const [survol, setSurvol] = useState<number | undefined>(undefined);
  const [choix, setChoix] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);
  if (!s || s.kind !== "bougies") return null;
  const n = s.bougies.length;
  const etape = e.etape ?? Number.POSITIVE_INFINITY;
  const visibles = s.revele ? (s.revele[Math.min(etape, s.revele.length - 1)] ?? n) : n;
  const pas = (L - GAUCHE - DROITE) / n;
  const indice = (clientX: number) => {
    const r = cadre.current?.getBoundingClientRect();
    if (!r) return undefined;
    const i = Math.floor((((clientX - r.left) / r.width) * L - GAUCHE) / pas);
    return i >= 0 && i < visibles ? i : undefined;
  };
  const basculer = (i: number) => {
    setVerdict(null);
    setChoix((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i].sort((a, b) => a - b)));
  };
  const valider = () => {
    const attendu = [...e.bonnes].sort((a, b) => a - b);
    setVerdict(choix.length === attendu.length && choix.every((x, k) => x === attendu[k]) ? "juste" : "faux");
  };
  const b = survol !== undefined ? s.bougies[survol] : undefined;
  return (
    <div>
      <div
        ref={cadre}
        role="group"
        tabIndex={0}
        aria-label={`${s.description} Touche une bougie pour la choisir ; flèches gauche et droite puis Entrée au clavier.`}
        className="relative cursor-pointer touch-pan-y rounded-xl"
        onPointerMove={(ev) => setSurvol(indice(ev.clientX))}
        onPointerLeave={() => setSurvol(undefined)}
        onClick={(ev) => {
          const i = indice(ev.clientX);
          if (i !== undefined) basculer(i);
        }}
        onKeyDown={(ev) => {
          if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
            ev.preventDefault();
            const depart = survol ?? (ev.key === "ArrowLeft" ? visibles : -1);
            setSurvol(Math.max(0, Math.min(visibles - 1, depart + (ev.key === "ArrowRight" ? 1 : -1))));
          } else if ((ev.key === "Enter" || ev.key === " ") && survol !== undefined) {
            ev.preventDefault();
            basculer(survol);
          }
        }}
      >
        <GraphiqueBougies scene={s} etape={etape} selection={survol} />
        {choix.map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 rounded-md border-2 border-brand bg-brand/10"
            style={{ left: `${((GAUCHE + pas * i) / L) * 100}%`, width: `${(pas / L) * 100}%` }}
          />
        ))}
      </div>
      <p className="mt-2 min-h-5 font-mono text-xs text-ink-2" aria-live="polite">
        {b ? `Bougie ${survol! + 1} · O ${formatPrix(b.o, s.decimales)} · H ${formatPrix(b.h, s.decimales)} · B ${formatPrix(b.l, s.decimales)} · C ${formatPrix(b.c, s.decimales)}` : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="flex-1 text-sm text-ink-2">{choix.length ? `Choisie${choix.length > 1 ? "s" : ""} : ${choix.map((i) => `bougie ${i + 1}`).join(", ")}` : "Aucune bougie choisie."}</p>
        <button type="button" className="btn btn-primaire" disabled={!choix.length} onClick={valider}>
          Valider
        </button>
      </div>
      {verdict ? <Corrige e={e} verdict={verdict} /> : null}
    </div>
  );
}

function Reflexion({ e }: { e: Extract<Exercice, { type: "reflexion" }> }) {
  const id = useId();
  const [texte, setTexte] = useState("");
  const [voir, setVoir] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="etiquette">
        Ta réponse (pour toi : elle n&apos;est pas envoyée)
      </label>
      <textarea id={id} className="champ" value={texte} onChange={(x) => setTexte(x.target.value)} maxLength={3000} />
      <button type="button" className="btn btn-secondaire mt-2" onClick={() => setVoir(true)} disabled={voir}>
        Comparer au corrigé
      </button>
      {voir ? <Corrige e={e} verdict={null} /> : null}
    </div>
  );
}

const libelles = { calcul: "Calcul", graphique: "Lecture de graphique", reflexion: "Réflexion" } as const;

/** Exercices d'application : correction immédiate, sans note ; le quiz qui suit valide le chapitre. */
export function Exercices({ exercices }: { exercices: Exercice[] }) {
  return (
    <ol className="space-y-6">
      {exercices.map((e, i) => (
        <li key={e.id} className="carte p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan">
            Exercice {i + 1} · {libelles[e.type]}
          </p>
          <p className="mt-2 text-ink">
            <TexteRiche texte={e.consigne} />
          </p>
          <div className="mt-4">{e.type === "calcul" ? <Calcul e={e} /> : e.type === "graphique" ? <Graphique e={e} /> : <Reflexion e={e} />}</div>
        </li>
      ))}
    </ol>
  );
}
