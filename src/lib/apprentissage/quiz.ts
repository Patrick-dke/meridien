import type { Question } from "@/content/schema";

/** Réponse de l'apprenant, selon le type de question. Les index désignent toujours l'ordre d'origine. */
export type Reponse =
  | { type: "unique"; choix: number | null }
  | { type: "multiple"; choix: number[] }
  | { type: "vraifaux"; valeur: boolean | null }
  /** Pour chaque élément de gauche, l'index de l'élément de droite choisi (ou -1). */
  | { type: "association"; choix: number[] }
  /** Les index d'origine des étapes, dans l'ordre choisi. */
  | { type: "ordre"; ordre: number[] }
  /** Les bougies touchées sur le graphique. */
  | { type: "graphique"; choix: number[] }
  /** Le graphique choisi : 0 pour A, 1 pour B. */
  | { type: "comparaison"; choix: 0 | 1 | null };

export const SEUIL_REUSSITE = 0.8;
export const TIRAGE_PAR_DEFAUT = 6;

/** Une question est « visuelle » si elle se répond en lisant un graphique. */
export const estVisuelle = (q: Question) => q.type === "graphique" || q.type === "comparaison" || Boolean(q.figure);

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
    case "graphique":
      return { type: "graphique", choix: [] };
    case "comparaison":
      return { type: "comparaison", choix: null };
  }
}

export function estComplete(q: Question, r: Reponse) {
  if (r.type === "unique" || r.type === "comparaison") return r.choix !== null;
  if (r.type === "multiple" || r.type === "graphique") return r.choix.length > 0;
  if (r.type === "vraifaux") return r.valeur !== null;
  if (r.type === "association") return r.choix.every((c) => c >= 0);
  return q.type === "ordre";
}

/** Crédit partiel des sélections : (justes − fausses) ÷ attendues, jamais négatif. */
const selection = (choix: number[], bonnes: number[]) => {
  const uniques = [...new Set(choix)];
  const justes = uniques.filter((c) => bonnes.includes(c)).length;
  const fausses = uniques.length - justes;
  return Math.max(0, (justes - fausses) / bonnes.length);
};

/** Note d'une question entre 0 et 1, avec crédit partiel pour les questions à plusieurs éléments. */
export function noter(q: Question, r: Reponse | undefined): number {
  if (!r) return 0;
  switch (q.type) {
    case "unique":
      return r.type === "unique" && r.choix === q.bonne ? 1 : 0;
    case "vraifaux":
      return r.type === "vraifaux" && r.valeur === q.reponse ? 1 : 0;
    case "multiple":
      return r.type === "multiple" ? selection(r.choix, q.bonnes) : 0;
    case "graphique":
      return r.type === "graphique" ? selection(r.choix, q.bonnes) : 0;
    case "comparaison":
      return r.type === "comparaison" && r.choix === q.bonne ? 1 : 0;
    case "association":
      if (r.type !== "association") return 0;
      return r.choix.filter((c, i) => c === i).length / q.paires.length;
    case "ordre":
      if (r.type !== "ordre") return 0;
      return r.ordre.filter((origine, position) => origine === position).length / q.etapes.length;
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

/** Générateur pseudo-aléatoire reproductible (mulberry32) : un tirage se rejoue à partir de sa graine. */
export function alea(graine: number) {
  let t = graine >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function melanger<T>(liste: T[], hasard: () => number): T[] {
  const t = [...liste];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

/**
 * Tirage d'une tentative dans la banque : `n` questions, dont au moins deux visuelles quand la banque en a,
 * chaque concept du chapitre couvert si possible, puis présentées de la plus facile à la plus difficile.
 */
export function tirerQuestions(banque: Question[], n: number, graine: number): Question[] {
  const hasard = alea(graine);
  const restantes = melanger(banque, hasard);
  if (banque.length <= n) return restantes.sort((a, b) => (a.difficulte ?? 2) - (b.difficulte ?? 2));
  const choisies: Question[] = [];
  const prendre = (q: Question) => {
    choisies.push(q);
    restantes.splice(restantes.indexOf(q), 1);
  };
  for (const q of restantes.filter(estVisuelle).slice(0, Math.min(2, n))) prendre(q);
  for (const concept of [...new Set(banque.flatMap((q) => q.concepts))]) {
    if (choisies.length >= n || choisies.some((q) => q.concepts.includes(concept))) continue;
    const q = restantes.find((x) => x.concepts.includes(concept));
    if (q) prendre(q);
  }
  while (choisies.length < n && restantes.length) prendre(restantes[0]);
  return choisies.sort((a, b) => (a.difficulte ?? 2) - (b.difficulte ?? 2));
}

/** Ordre d'affichage des choix d'une question pour une tentative (les réponses gardent leurs index d'origine). */
export function ordreAffichage(n: number, graine: number, id: string) {
  let h = graine >>> 0;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return melanger(
    Array.from({ length: n }, (_, i) => i),
    alea(h),
  );
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
