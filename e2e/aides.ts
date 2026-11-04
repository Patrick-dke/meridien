import type { Locator, Page } from "@playwright/test";
import { chapitresPublies } from "../src/content";
import type { Question } from "../src/content/schema";

/** Texte comparable : espaces insécables, apostrophes typographiques et espaces avant ponctuation neutralisés. */
const normaliser = (t: string) =>
  t
    .replace(/[\s  ]+/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/ ([:;?!»])/g, "$1")
    .replace(/« /g, "«")
    .trim();

/** Coche l'option dont le libellé est `texte` (l'ordre des choix change à chaque tentative). */
async function cocher(champ: Locator, texte: string) {
  const libelles = (await champ.locator("label").allTextContents()).map(normaliser);
  const i = libelles.findIndex((l) => l === normaliser(texte));
  if (i < 0) throw new Error(`Option introuvable : ${texte}`);
  await champ.locator("label").nth(i).locator("input").check();
}

async function repondre(page: Page, q: Question, juste: boolean) {
  const champ = page.locator(`fieldset[data-question="${q.id}"]`);
  switch (q.type) {
    case "unique":
      return cocher(champ, q.choix[juste ? q.bonne : (q.bonne + 1) % q.choix.length]);
    case "multiple":
      if (!juste) return cocher(champ, q.choix[q.choix.findIndex((_, i) => !q.bonnes.includes(i))]);
      for (const b of q.bonnes) await cocher(champ, q.choix[b]);
      return;
    case "vraifaux":
      return champ.getByRole("radio", { name: q.reponse === juste ? "Vrai" : "Faux", exact: true }).check();
    case "comparaison":
      return champ.locator('input[type="radio"]').nth(juste ? q.bonne : 1 - q.bonne).check();
    case "association":
      for (const [i] of q.paires.entries())
        await champ.locator(`select[id="${q.id}-${i}"]`).selectOption({ label: q.paires[juste ? i : (i + 1) % q.paires.length][1] });
      return;
    case "ordre": {
      // L'ordre de départ est déjà mélangé (jamais juste) : pour une réponse fausse, on le laisse.
      if (!juste) return;
      for (const [cible, etape] of q.etapes.entries()) {
        const textes = (await champ.locator("ol > li").allTextContents()).map(normaliser);
        const position = textes.findIndex((t) => t.includes(normaliser(etape)));
        for (let k = position; k > cible; k--) await champ.getByRole("button", { name: `Monter « ${etape} »` }).click();
      }
      return;
    }
    case "graphique": {
      // Au clavier : flèche droite jusqu'à la bougie, puis Entrée.
      const groupe = champ.getByRole("group");
      await groupe.focus();
      const choix = juste ? [...q.bonnes].sort((a, b) => a - b) : [q.bonnes.includes(0) ? 1 : 0];
      let curseur = -1;
      for (const b of choix) {
        for (; curseur < b; curseur++) await groupe.press("ArrowRight");
        await groupe.press("Enter");
      }
      return;
    }
  }
}

/**
 * Répond au quiz d'un chapitre, quelle que soit la série tirée : chaque question affichée est retrouvée dans la
 * banque du chapitre par son identifiant. `justes` = false répond faux partout.
 */
export async function repondreQuiz(page: Page, slug: string, justes = true) {
  const banque = chapitresPublies.find((c) => c.slug === slug)?.quiz ?? [];
  for (;;) {
    const id = await page.locator("fieldset[data-question]").getAttribute("data-question");
    const q = banque.find((x) => x.id === id);
    if (!q) throw new Error(`Question inconnue : ${id}`);
    await repondre(page, q, justes);
    await page.getByRole("button", { name: "Vérifier" }).click();
    const fin = page.getByRole("button", { name: "Voir mon résultat" });
    if (await fin.isVisible()) return fin.click();
    await page.getByRole("button", { name: "Question suivante" }).click();
  }
}

/** Quiz du premier chapitre gratuit. */
export const repondreQuizChapitre1 = (page: Page, justes = true) => repondreQuiz(page, "quest-ce-que-le-trading", justes);
