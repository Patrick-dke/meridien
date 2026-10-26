import type { Question } from "@/content/schema";

/** Réponse de l'apprenant, selon le type de question. */
export type Reponse =
  | { type: "unique"; choix: number | null }
  | { type: "multiple"; choix: number[] }
  | { type: "vraifaux"; valeur: boolean | null }
  /** Pour chaque élément de gauche, l'index de l'élément de droite choisi (ou -1). */
  | { type: "association"; choix: number[] }
  /** Les index d'origine des étapes, dans l'ordre choisi. */
  | { type: "ordre"; ordre: number[] };

export const SEUIL_REUSSITE = 0.8;

export function reponseVide(q: Question): Reponse {
  switch (q.type) {
    case "unique":
      return { type: "unique", choix: null };
    case "multiple":
      return { type: "multiple", choix: [] };
    case "vraifaux":
      return { type: "vraifaux", valeur: null };
    case "association":
      return { type: "association", choix: q.paires.map(() => -1) };
    case "ordre":
      return { type: "ordre", ordre: melangeDeterministe(q.etapes.length, q.id) };
  }
}

export function estComplete(q: Question, r: Reponse) {
  if (r.type === "unique") return r.choix !== null;
  if (r.type === "multiple") return r.choix.length > 0;
  if (r.type === "vraifaux") return r.valeur !== null;
  if (r.type === "association") return r.choix.every((c) => c >= 0);
  return q.type === "ordre";
}

/** Note d'une question entre 0 et 1, avec crédit partiel pour les questions à plusieurs éléments. */
export function noter(q: Question, r: Reponse): number {
  switch (q.type) {
    case "unique":
      return r.type === "unique" && r.choix === q.bonne ? 1 : 0;
    case "vraifaux":
      return r.type === "vraifaux" && r.valeur === q.reponse ? 1 : 0;
    case "multiple": {
      if (r.type !== "multiple") return 0;
      const justes = r.choix.filter((c) => q.bonnes.includes(c)).length;
      const fausses = r.choix.filter((c) => !q.bonnes.includes(c)).length;
      return Math.max(0, (justes - fausses) / q.bonnes.length);
    }
    case "association": {
      if (r.type !== "association") return 0;
      return r.choix.filter((c, i) => c === i).length / q.paires.length;
    }
    case "ordre": {
      if (r.type !== "ordre") return 0;
      return r.ordre.filter((origine, position) => origine === position).length / q.etapes.length;
    }
  }
}

/** Score global et score par concept (moyenne des questions qui le testent). */
export function noterQuiz(questions: Question[], reponses: Reponse[]) {
  const notes = questions.map((q, i) => noter(q, reponses[i]));
  const score = notes.reduce((a, b) => a + b, 0) / questions.length;
  const parConcept = new Map<string, number[]>();
  questions.forEach((q, i) => {
    for (const c of q.concepts) parConcept.set(c, [...(parConcept.get(c) ?? []), notes[i]]);
  });
  return {
    notes,
    score,
    reussi: score >= SEUIL_REUSSITE - 1e-9,
    parConcept: [...parConcept].map(([concept, s]) => ({ concept, score: s.reduce((a, b) => a + b, 0) / s.length })),
  };
}

/**
 * Permutation stable dérivée d'une graine textuelle, jamais égale à l'identité quand n > 1 :
 * l'ordre affiché ne doit pas donner la réponse.
 */
export function melangeDeterministe(n: number, graine: string): number[] {
  let h = 2166136261;
  for (const ch of graine) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
    const j = h % (i + 1);
    [t[i], t[j]] = [t[j], t[i]];
  }
  if (n > 1 && t.every((v, i) => v === i)) [t[0], t[1]] = [t[1], t[0]];
  return t;
}
