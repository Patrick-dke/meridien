// Assemble ce que la base doit servir aux acheteurs : chapitres payants et leurs scènes, corrigés des quiz
// (pour la notation officielle, y compris ceux des chapitres gratuits) et narrations audio.
// Nécessite le dossier prive/ (hors dépôt public).
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chapitresPublies } from "../../src/content";
import { moduleDuChapitre } from "../../src/content/offre";
import type { Chapitre } from "../../src/content/schema";
import { scenesUtilisees } from "../../src/content/verifier";
import type { SceneFigure } from "../../src/lib/chartkit/types";
import { empreinteTextes } from "../../src/lib/narration";

/** Taille maximale d'un morceau d'audio en base64 : un document Firestore ne dépasse pas 1 Mio. */
const MORCEAU = 700_000;

export type Publication = {
  version: string;
  contenus: { slug: string; module: string; titre: string; chapitre: Chapitre; scenes: Record<string, SceneFigure> }[];
  corriges: { slug: string; module: string; quiz: Chapitre["quiz"] }[];
  narrations: ({ slug: string; module: string; type: string; audio?: string; morceaux?: string[] } & Record<string, unknown>)[];
  avertissements: string[];
};

/**
 * Documents Firestore : la base refuse les tableaux imbriqués (paires d'association, lignes de tableaux),
 * donc chapitre, scènes et quiz y sont stockés en texte JSON, relu tel quel par le site et le serveur.
 */
export function versDocuments(p: Publication) {
  return {
    contenus: p.contenus.map((c) => ({ id: c.slug, donnees: { module: c.module, titre: c.titre, chapitreJson: JSON.stringify(c.chapitre), scenesJson: JSON.stringify(c.scenes), version: p.version } })),
    corriges: p.corriges.map((c) => ({ id: c.slug, donnees: { module: c.module, quizJson: JSON.stringify(c.quiz), version: p.version } })),
  };
}

export async function preparerPublication(racine = process.cwd()): Promise<Publication> {
  const chemin = join(racine, "prive", "index.ts");
  if (!existsSync(chemin)) throw new Error("Dossier prive/ introuvable : les contenus payants ne sont pas sur cet ordinateur.");
  const prive = (await import(pathToFileURL(chemin).href)) as { chapitresParModule: Record<string, Chapitre[]>; scenesPrivees: Record<string, SceneFigure> };
  const avertissements: string[] = [];
  const contenus: Publication["contenus"] = [];
  const narrations: Publication["narrations"] = [];

  for (const [module, chapitres] of Object.entries(prive.chapitresParModule)) {
    for (const c of chapitres) {
      const scenes = Object.fromEntries(scenesUtilisees(c).filter((id) => id in prive.scenesPrivees).map((id) => [id, prive.scenesPrivees[id]]));
      contenus.push({ slug: c.slug, module, titre: c.titre, chapitre: c, scenes });
      const minutage = join(racine, "prive", "narration", `${c.slug}.json`);
      const mp3 = join(racine, "prive", "audio", `${c.slug}.mp3`);
      if (!existsSync(minutage) || !existsSync(mp3)) {
        avertissements.push(`${c.slug} : pas de narration (npm run voix -- prives)`);
        continue;
      }
      const n = JSON.parse(readFileSync(minutage, "utf8"));
      if (n.empreinte !== empreinteTextes(c.capsule.scenes.map((s) => s.texte))) {
        avertissements.push(`${c.slug} : narration périmée, non publiée (npm run voix -- prives)`);
        continue;
      }
      const audio = readFileSync(mp3).toString("base64");
      const { audio: _chemin, ...reste } = n;
      void _chemin;
      narrations.push({
        ...reste,
        slug: c.slug,
        module,
        type: "audio/mpeg",
        ...(audio.length > MORCEAU ? { morceaux: audio.match(new RegExp(`.{1,${MORCEAU}}`, "g"))! } : { audio }),
      });
    }
  }

  const corriges: Publication["corriges"] = [
    ...contenus.map((c) => ({ slug: c.slug, module: c.module, quiz: c.chapitre.quiz })),
    ...chapitresPublies.map((c) => ({ slug: c.slug, module: moduleDuChapitre(c.slug)?.id ?? "premiers-pas", quiz: c.quiz })),
  ];
  const empreinte = createHash("sha256").update(JSON.stringify(contenus)).update(JSON.stringify(corriges)).digest("hex").slice(0, 8);
  const version = `${new Date().toISOString().slice(0, 10)}-${empreinte}`;
  return { version, contenus, corriges, narrations, avertissements };
}
