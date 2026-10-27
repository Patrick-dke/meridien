import { bougieValide } from "@/lib/chartkit/outils";
import type { SceneFigure } from "@/lib/chartkit/types";
import { decouper, texteBrut } from "@/lib/typographie";
import { Chapitre, type Bloc } from "./schema";

/** Ce qu'un chapitre a le droit de citer : catalogue, concepts, glossaire et scènes connus. */
export type Contexte = {
  slugsCatalogue: Set<string>;
  idsConcepts: Set<string>;
  slugsGlossaire: Set<string>;
  scenes: Record<string, SceneFigure>;
};

/** Tous les textes d'un chapitre où la syntaxe [[terme]] et **gras** est permise. */
export function textes(c: Chapitre): string[] {
  const deBlocs = (blocs: Bloc[]): string[] =>
    blocs.flatMap((b) => {
      if (b.type === "p" || b.type === "encadre" || b.type === "formule") return [b.texte];
      if (b.type === "liste") return b.items;
      if (b.type === "tableau") return b.lignes.flat();
      return [];
    });
  return [
    c.intro,
    ...c.cours.flatMap((s) => deBlocs(s.blocs)),
    ...deBlocs(c.illustrations),
    ...(c.exemple ? deBlocs(c.exemple.blocs) : []),
    ...c.erreurs.map((e) => e.texte),
    ...c.resume,
  ];
}

export function scenesUtilisees(c: Chapitre): string[] {
  const deBlocs = (blocs: Bloc[]) => blocs.flatMap((b) => (b.type === "figure" ? [b.scene] : []));
  return [
    ...c.cours.flatMap((s) => deBlocs(s.blocs)),
    ...deBlocs(c.illustrations),
    ...(c.exemple ? deBlocs(c.exemple.blocs) : []),
    ...c.capsule.scenes.flatMap((s) => (s.visuel.type === "figure" ? [s.visuel.scene] : [])),
    ...c.exercices.flatMap((e) => (e.type === "graphique" ? [e.scene] : [])),
  ];
}

/** Bougies visibles d'une scène de chandeliers à une étape donnée (toutes par défaut). */
function visibles(s: SceneFigure, etape?: number) {
  if (s.kind !== "bougies") return 0;
  const e = etape ?? Number.POSITIVE_INFINITY;
  return s.revele ? (s.revele[Math.min(e, s.revele.length - 1)] ?? s.bougies.length) : s.bougies.length;
}

/**
 * Liste les problèmes d'un chapitre (vide s'il est correct). Les tests de contenu et les rédacteurs
 * appliquent ainsi exactement les mêmes règles.
 */
export function problemesChapitre(c: Chapitre, ctx: Contexte): string[] {
  const p: string[] = [];
  const schema = Chapitre.safeParse(c);
  if (!schema.success) return schema.error.issues.map((i) => `schéma : ${i.path.join(".")} — ${i.message}`);

  if (!ctx.slugsCatalogue.has(c.slug)) p.push(`slug absent du catalogue : ${c.slug}`);
  for (const id of [...c.concepts, ...c.prerequis, ...c.quiz.flatMap((q) => q.concepts), ...c.exercices.flatMap((e) => e.concepts)]) {
    if (!ctx.idsConcepts.has(id)) p.push(`concept inconnu : ${id}`);
  }
  for (const t of textes(c)) {
    for (const s of decouper(t)) if (s.type === "terme" && !ctx.slugsGlossaire.has(s.slug)) p.push(`terme absent du glossaire : ${s.slug}`);
  }
  for (const s of scenesUtilisees(c)) if (!ctx.scenes[s]) p.push(`scène inconnue : ${s}`);
  for (const [id, s] of Object.entries(ctx.scenes)) {
    if (s.kind === "bougies" && scenesUtilisees(c).includes(id) && !s.bougies.every(bougieValide)) p.push(`scène ${id} : bougie incohérente (h ≥ max(o,c), l ≤ min(o,c))`);
  }

  const idsQuiz = c.quiz.map((q) => q.id);
  if (new Set(idsQuiz).size !== idsQuiz.length) p.push("identifiants de quiz en double");
  for (const q of c.quiz) {
    if (q.type === "unique" && q.bonne >= q.choix.length) p.push(`${q.id} : bonne réponse hors des choix`);
    if (q.type === "multiple") {
      if (new Set(q.bonnes).size !== q.bonnes.length) p.push(`${q.id} : bonnes réponses en double`);
      if (!q.bonnes.every((b) => b < q.choix.length)) p.push(`${q.id} : bonne réponse hors des choix`);
      if (q.bonnes.length >= q.choix.length) p.push(`${q.id} : toutes les réponses sont bonnes`);
    }
    if (q.type === "association" && new Set(q.paires.map((x) => x[1])).size !== q.paires.length) p.push(`${q.id} : associations ambiguës`);
    if (q.type === "ordre" && new Set(q.etapes).size !== q.etapes.length) p.push(`${q.id} : étapes en double`);
  }

  const idsEx = c.exercices.map((e) => e.id);
  if (new Set(idsEx).size !== idsEx.length) p.push("identifiants d'exercices en double");
  for (const e of c.exercices) {
    if (e.type === "graphique") {
      const s = ctx.scenes[e.scene];
      if (s && s.kind !== "bougies") p.push(`${e.id} : un exercice graphique demande une scène de chandeliers`);
      if (s && s.kind === "bougies" && !e.bonnes.every((i) => i < visibles(s, e.etape))) p.push(`${e.id} : bougie attendue hors de celles affichées`);
    }
    if (e.type === "calcul" && e.tolerance > Math.abs(e.reponse) * 0.05 + 0.01) p.push(`${e.id} : tolérance trop large (au plus 5 % de la réponse)`);
  }

  const duree = c.capsule.scenes.reduce((a, s) => a + s.duree, 0);
  if (duree < 30 || duree > 90) p.push(`capsule de ${duree} s (attendu : 30 à 90 s)`);
  for (const s of c.capsule.scenes) {
    const mots = texteBrut(s.texte).split(/\s+/).filter(Boolean).length;
    // Au plus 190 mots par minute : le texte doit pouvoir être lu, puis dit, dans la durée de la scène.
    if (mots / s.duree > 190 / 60) p.push(`scène trop dense (${mots} mots en ${s.duree} s) : « ${s.texte.slice(0, 50)}… »`);
  }
  return p;
}
