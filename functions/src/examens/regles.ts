import { noter } from "../quiz";

/**
 * Examens de fin de module : règles pures (tirage, version sans corrigé, notation, correction détaillée),
 * éprouvées par regles.test.ts. Les questions viennent des banques de quiz des chapitres du module ; leur
 * difficulté donne le niveau : 1 connaissance, 2 application, 3 transfert (situation nouvelle).
 */
export type Niveau = "connaissance" | "application" | "transfert";
export const NIVEAUX: Niveau[] = ["connaissance", "application", "transfert"];

export type QuestionBanque = {
  id: string;
  type: "unique" | "multiple" | "vraifaux" | "association" | "ordre" | "graphique" | "comparaison";
  enonce: string;
  explication: string;
  concepts: string[];
  difficulte?: 1 | 2 | 3;
  choix?: string[];
  bonne?: number;
  bonnes?: number[];
  reponse?: boolean;
  paires?: [string, string][];
  etapes?: string[];
  scene?: string;
  figure?: { scene: string };
  graphiques?: [{ scene: string }, { scene: string }];
  [cle: string]: unknown;
};
/** Une question de la banque d'un module, avec le chapitre d'où elle vient. */
export type Candidate = { slug: string; q: QuestionBanque };
/** Une question tirée : son origine, son niveau et, pour les associations et les ordres, la permutation montrée. */
export type Tiree = { slug: string; id: string; niveau: Niveau; perm?: number[] };

export type ConfigExamen = { seuil: number; connaissance: number; application: number; transfert: number; attenteMinutes: number };
export const CONFIG_DEPART: ConfigExamen = { seuil: 0.7, connaissance: 6, application: 6, transfert: 4, attenteMinutes: 0 };

const borne = (x: unknown, min: number, max: number, defaut: number) => {
  const n = Number(x);
  return Number.isFinite(n) && n >= min && n <= max ? n : defaut;
};
export function lireConfig(d: Record<string, unknown> | undefined): ConfigExamen {
  return {
    seuil: borne(d?.seuil, 0.5, 1, CONFIG_DEPART.seuil),
    connaissance: Math.round(borne(d?.connaissance, 0, 20, CONFIG_DEPART.connaissance)),
    application: Math.round(borne(d?.application, 0, 20, CONFIG_DEPART.application)),
    transfert: Math.round(borne(d?.transfert, 0, 20, CONFIG_DEPART.transfert)),
    attenteMinutes: Math.round(borne(d?.attenteMinutes, 0, 7 * 24 * 60, CONFIG_DEPART.attenteMinutes)),
  };
}

export const niveauDe = (q: QuestionBanque): Niveau => (q.difficulte === 1 ? "connaissance" : q.difficulte === 3 ? "transfert" : "application");
export const cleQuestion = (slug: string, id: string) => `${slug}/${id}`;

/** Générateur reproductible (mulberry32). */
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
/** Permutation jamais égale à l'identité (n > 1) : l'ordre montré ne doit pas donner la réponse. */
export function permutation(n: number, hasard: () => number) {
  const p = melanger(
    Array.from({ length: n }, (_, i) => i),
    hasard,
  );
  if (n > 1 && p.every((v, i) => v === i)) [p[0], p[1]] = [p[1], p[0]];
  return p;
}

/**
 * Tirage d'une variante : pour chaque niveau, des questions réparties sur le plus de chapitres possible, en
 * écartant d'abord celles de la tentative précédente. Un niveau trop pauvre est complété par les autres.
 */
export function tirerExamen(banque: Candidate[], config: ConfigExamen, precedentes: Set<string>, hasard: () => number): Tiree[] {
  const prises = new Set<string>();
  const tirees: Tiree[] = [];
  const tirerDans = (candidates: Candidate[], n: number, niveau: (c: Candidate) => Niveau) => {
    // Nouvelles questions d'abord, au hasard ; puis tour de rôle entre chapitres.
    const ordonnees = [
      ...melanger(
        candidates.filter((c) => !precedentes.has(cleQuestion(c.slug, c.q.id))),
        hasard,
      ),
      ...melanger(
        candidates.filter((c) => precedentes.has(cleQuestion(c.slug, c.q.id))),
        hasard,
      ),
    ];
    const parChapitre = new Map<string, Candidate[]>();
    for (const c of ordonnees) parChapitre.set(c.slug, [...(parChapitre.get(c.slug) ?? []), c]);
    const files = melanger([...parChapitre.values()], hasard);
    let pris = 0;
    while (pris < n && files.some((f) => f.length)) {
      for (const f of files) {
        if (pris >= n) break;
        const c = f.shift();
        if (!c || prises.has(cleQuestion(c.slug, c.q.id))) continue;
        prises.add(cleQuestion(c.slug, c.q.id));
        const nb = c.q.type === "association" ? (c.q.paires?.length ?? 0) : c.q.type === "ordre" ? (c.q.etapes?.length ?? 0) : 0;
        tirees.push({ slug: c.slug, id: c.q.id, niveau: niveau(c), ...(nb ? { perm: permutation(nb, hasard) } : {}) });
        pris++;
      }
    }
    return pris;
  };
  let manque = 0;
  for (const niveau of NIVEAUX) {
    const n = config[niveau];
    manque +=
      n -
      tirerDans(
        banque.filter((c) => niveauDe(c.q) === niveau),
        n,
        () => niveau,
      );
  }
  if (manque > 0)
    tirerDans(
      banque.filter((c) => !prises.has(cleQuestion(c.slug, c.q.id))),
      manque,
      (c) => niveauDe(c.q),
    );
  // Présentation par niveau croissant : on commence par ce qu'il faut savoir, on finit par le transfert.
  return tirees.sort((a, b) => NIVEAUX.indexOf(a.niveau) - NIVEAUX.indexOf(b.niveau));
}

/**
 * Ce que reçoit le navigateur : la question sans son corrigé (valeurs neutres), les paires et les étapes
 * déjà permutées. Les réponses du navigateur portent sur ces positions ; `ramener` les remet dans l'ordre d'origine.
 */
export function versionSansCorrige(q: QuestionBanque, t: Tiree) {
  const v: Record<string, unknown> = { ...q, explication: "" };
  delete v.difficulte;
  if ("bonne" in v) v.bonne = -1;
  if ("bonnes" in v) v.bonnes = [];
  if ("reponse" in v) v.reponse = false;
  if (q.type === "association" && q.paires && t.perm) v.paires = q.paires.map(([g], i) => [g, q.paires![t.perm![i]][1]]);
  if (q.type === "ordre" && q.etapes && t.perm) v.etapes = t.perm.map((i) => q.etapes![i]);
  return { ...v, niveau: t.niveau };
}

const entiers = (x: unknown): x is number[] => Array.isArray(x) && x.length <= 20 && x.every((v) => Number.isInteger(v));

/** Réponse du navigateur ramenée aux index d'origine (associations et ordres), avant la notation habituelle. */
export function ramener(q: QuestionBanque, t: Tiree, r: unknown): unknown {
  const rep = (r ?? {}) as { type?: string; choix?: unknown; ordre?: unknown };
  if (!t.perm) return r;
  const p = t.perm;
  if (q.type === "association" && rep.type === "association" && entiers(rep.choix)) return { type: "association", choix: rep.choix.map((j) => p[j] ?? -1) };
  if (q.type === "ordre" && rep.type === "ordre" && entiers(rep.ordre)) return { type: "ordre", ordre: rep.ordre.map((j) => p[j] ?? -1) };
  return null;
}

/** Réponse attendue, en clair, pour la correction détaillée. */
export function attendue(q: QuestionBanque): string {
  switch (q.type) {
    case "unique":
      return q.choix?.[q.bonne ?? -1] ?? "";
    case "multiple":
      return (q.bonnes ?? []).map((i) => q.choix?.[i]).join(" ; ");
    case "vraifaux":
      return q.reponse ? "Vrai" : "Faux";
    case "association":
      return (q.paires ?? []).map(([a, b]) => `${a} → ${b}`).join(" ; ");
    case "ordre":
      return (q.etapes ?? []).join(" → ");
    case "graphique":
      return `Bougie${(q.bonnes ?? []).length > 1 ? "s" : ""} n° ${(q.bonnes ?? []).map((b) => b + 1).join(", ")} (en comptant depuis la gauche)`;
    case "comparaison":
      return `Graphique ${q.bonne === 0 ? "A" : "B"}`;
  }
}

const moyenne = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Notation d'une copie : score global, par niveau, par concept, chapitres à revoir et correction détaillée. */
export function corriger(tirees: Tiree[], banque: Map<string, QuestionBanque>, reponses: unknown[], seuil: number) {
  const lignes = tirees.map((t, i) => {
    const q = banque.get(cleQuestion(t.slug, t.id))!;
    const note = noter(q as Parameters<typeof noter>[0], ramener(q, t, reponses[i]) as Parameters<typeof noter>[1]);
    return { t, q, note };
  });
  const score = moyenne(lignes.map((l) => l.note));
  const parNiveau = NIVEAUX.map((niveau) => {
    const ls = lignes.filter((l) => l.t.niveau === niveau);
    return { niveau, questions: ls.length, score: ls.length ? moyenne(ls.map((l) => l.note)) : null };
  });
  const concepts = new Map<string, number[]>();
  for (const l of lignes) for (const c of l.q.concepts) concepts.set(c, [...(concepts.get(c) ?? []), l.note]);
  const parConcept = [...concepts].map(([concept, s]) => ({ concept, score: moyenne(s) })).sort((a, b) => a.score - b.score);
  const chapitres = new Map<string, { notes: number[]; concepts: Set<string> }>();
  for (const l of lignes) {
    const c = chapitres.get(l.t.slug) ?? { notes: [], concepts: new Set<string>() };
    c.notes.push(l.note);
    if (l.note < 0.999) l.q.concepts.forEach((x) => c.concepts.add(x));
    chapitres.set(l.t.slug, c);
  }
  const aRevoir = [...chapitres]
    .map(([slug, c]) => ({ slug, score: moyenne(c.notes), concepts: [...c.concepts] }))
    .filter((c) => c.score < 0.75)
    .sort((a, b) => a.score - b.score);
  return {
    score,
    reussi: score >= seuil - 1e-9,
    parNiveau,
    parConcept,
    aRevoir,
    correction: lignes.map((l) => ({
      slug: l.t.slug,
      id: l.t.id,
      niveau: l.t.niveau,
      enonce: l.q.enonce,
      note: l.note,
      attendue: attendue(l.q),
      explication: l.q.explication,
    })),
  };
}
