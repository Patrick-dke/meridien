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
  "/formations/",
  "/formations/price-action/",
  "/chapitre/rejets-et-meches/",
  "/connexion/",
  "/inscription/",
  "/mot-de-passe/",
  "/paiement/?module=price-action",
];

for (const chemin of pages) {
  test(`aucune violation d'accessibilité grave sur ${chemin}`, async ({ page }) => {
    // Le glossaire complet est une longue page : son analyse dépasse parfois 30 s sur une machine chargée. Les pages qui
    // chargent Firebase attendent aussi la fin de leurs requêtes : base de production et, sur mobile, bibliothèque Google
    // de connexion (jusqu'à 60 s sur ce réseau).
    test.setTimeout(120_000);
    // État final de la page : une apparition au défilement saisie en pleine animation donnerait un contraste transitoire.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(chemin);
    await page.waitForLoadState("networkidle");
    const resultat = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const graves = resultat.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => `${v.id} : ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}
