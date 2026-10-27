import { expect, test } from "@playwright/test";

const largeurs = [320, 375, 414, 768, 1024, 1440];
const pages = ["/", "/academies/", "/academies/fondamentaux/outils-du-trader/", "/parcours/premiers-pas/", "/chapitre/stop-loss-take-profit/", "/tableau-de-bord/", "/outils/", "/formations/", "/formations/smart-money-concepts/", "/chapitre/rejets-et-meches/", "/inscription/"];

test.describe("mise en page sur plusieurs tailles d'écran", () => {
  test.skip(({ isMobile }) => isMobile, "Les largeurs sont fixées explicitement");

  for (const largeur of largeurs) {
    test(`aucun défilement horizontal à ${largeur} px`, async ({ page }, info) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: largeur, height: largeur < 768 ? 800 : 900 });
      for (const chemin of pages) {
        await page.goto(chemin, { waitUntil: "load" });
        await page.waitForTimeout(300);
        const { debord, fautifs } = await page.evaluate(() => {
          const l = document.documentElement.clientWidth;
          return {
            debord: document.documentElement.scrollWidth - l,
            // Les éléments qui dépassent, pour un message d'échec qui dit où chercher.
            fautifs: [...document.querySelectorAll("body *")]
              .filter((el) => el.getBoundingClientRect().right > l + 1)
              .slice(0, 4)
              .map((el) => `${el.tagName}.${String((el as HTMLElement).className).slice(0, 60)}`),
          };
        });
        expect(debord, `${chemin} à ${largeur} px : ${fautifs.join(" | ")}`).toBeLessThanOrEqual(1);
        if (largeur < 768) {
          // Cibles tactiles : boutons et liens visibles d'au moins 24 px de haut (WCAG 2.5.8), hors texte courant.
          const petites = await page.evaluate(() =>
            [...document.querySelectorAll<HTMLElement>("button, a.btn, [role=button]")]
              .filter((el) => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" && r.height < 24;
              })
              .map((el) => el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 40)),
          );
          expect(petites, `${chemin} à ${largeur} px`).toEqual([]);
        }
        await page.screenshot({ path: info.outputPath(`${chemin.replace(/\//g, "_") || "accueil"}-${largeur}.png`), fullPage: false });
      }
    });
  }
});
