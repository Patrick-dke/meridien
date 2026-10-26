import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Narration } from "@/lib/narration";

/**
 * Minutage de la narration d'une capsule (src/content/narration/<slug>.json, produit par scripts/voix).
 * Lu au moment de la construction du site : rien n'est chargé côté navigateur en dehors de la page.
 */
export function narration(slug: string): Narration | null {
  const chemin = join(process.cwd(), "src", "content", "narration", `${slug}.json`);
  return existsSync(chemin) ? (JSON.parse(readFileSync(chemin, "utf8")) as Narration) : null;
}
