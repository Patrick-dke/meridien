// Contrôle des indices : la description d'un graphique de question (infobulle <title>, texte des lecteurs d'écran)
// ne doit pas donner la réponse. Heuristique : la description contient le texte d'une bonne réponse, ou un nombre
// propre aux bonnes réponses. Chaque cas signalé se relit : un prix lisible sur le graphique n'est pas un indice.
// Usage : npm run verifier:indices (chapitres gratuits, et payants si le dossier prive/ est présent)
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Chapitre, Question } from "../../src/content/schema";

type Scenes = Record<string, { description?: string }>;

const norm = (t: string) =>
  t
    .toLowerCase()
    .replace(/[\s  ]+/g, " ")
    .replace(/[’‘]/g, "'")
    .trim();
const nombres = (t: string) => new Set(norm(t).match(/\d+(?:[,.]\d+)?/g) ?? []);

/** Scènes montrées avec la question : figure, graphique à toucher, graphiques comparés. */
function scenesDe(q: Question): string[] {
  const r = q as unknown as Record<string, unknown>;
  const s: string[] = [];
  if (typeof r.scene === "string") s.push(r.scene);
  const f = r.figure as { scene?: string } | undefined;
  if (f?.scene) s.push(f.scene);
  for (const k of ["figures", "graphiques"]) for (const g of (r[k] as { scene?: string }[] | undefined) ?? []) if (g.scene) s.push(g.scene);
  return s;
}

function bonnesEtFausses(q: Question): [string[], string[]] {
  const r = q as unknown as { choix?: string[]; bonne?: number; bonnes?: number[] };
  if (!r.choix) return [[], []];
  const bonnes = q.type === "multiple" ? (r.bonnes ?? []) : r.bonne !== undefined ? [r.bonne] : [];
  return [bonnes.map((i) => r.choix![i]), r.choix.filter((_, i) => !bonnes.includes(i))];
}

async function main() {
  const charger = <T>(...chemin: string[]) => import(pathToFileURL(join(process.cwd(), ...chemin)).href) as Promise<T>;
  const publics = await charger<{ chapitresPublies: Chapitre[] }>("src", "content", "index.ts");
  const { scenes } = await charger<{ scenes: Scenes }>("src", "content", "scenes.ts");
  const prive = existsSync(join(process.cwd(), "prive", "index.ts"))
    ? await charger<{ chapitresParModule: Record<string, Chapitre[]>; scenesPrivees: Scenes }>("prive", "index.ts")
    : { chapitresParModule: {}, scenesPrivees: {} };
  const toutes: Scenes = { ...scenes, ...prive.scenesPrivees };
  const lots: [string, Chapitre[]][] = [["gratuit", publics.chapitresPublies], ...Object.entries(prive.chapitresParModule)];

  let n = 0;
  for (const [module, chapitres] of lots)
    for (const c of chapitres)
      for (const q of c.quiz) {
        const [bonnes, fausses] = bonnesEtFausses(q);
        if (!bonnes.length) continue;
        const nombresFaux = new Set(fausses.flatMap((f) => [...nombres(f)]));
        for (const id of scenesDe(q)) {
          const d = norm(toutes[id]?.description ?? "");
          if (!d) continue;
          const motifs: string[] = [];
          for (const b of bonnes) {
            if (norm(b).length >= 5 && d.includes(norm(b))) motifs.push(`texte « ${b} »`);
            for (const x of nombres(b)) if (x.length >= 2 && !nombresFaux.has(x) && d.includes(x)) motifs.push(`nombre ${x}`);
          }
          if (!motifs.length) continue;
          n++;
          console.log(`${module} | ${c.slug}/${q.id} | ${id} | ${motifs.join(", ")}\n    Q : ${q.enonce}\n    D : ${toutes[id]?.description}`);
        }
      }
  console.log(`${n} cas à relire.`);
}

void main();
