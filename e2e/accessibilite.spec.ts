import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  "/",
  "/commencer/",
  "/parcours/premiers-pas/",
  "/academies/",
  "/academies/fondamentaux/introduction/",
  "/chapitre/formation-des-prix/",
  "/chapitre/formation-des-prix/#etape-quiz",
  "/chapitre/marge-et-levier/#etape-illustrations",
  "/glossaire/",
  "/glossaire/spread/",
  "/outils/",
  "/tableau-de-bord/",
  "/parametres/",
  "/methode/",
  "/legal/risques/",
];

for (const chemin of pages) {
  test(`aucune violation d'accessibilité grave sur ${chemin}`, async ({ page }) => {
    await page.goto(chemin);
    await page.waitForLoadState("networkidle");
    const resultat = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const graves = resultat.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => `${v.id} : ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}
