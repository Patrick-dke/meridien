import { expect, test } from "@playwright/test";

test("le calculateur de position donne 10 puis 20 actions selon le stop", async ({ page }) => {
  await page.goto("/outils/");
  const position = page.locator("#position");
  await expect(position.getByText("Quantité (arrondie à l'unité inférieure)").locator("..")).toContainText("10");
  await position.getByLabel("Prix du stop loss").fill("49");
  await expect(position.getByText("Quantité (arrondie à l'unité inférieure)").locator("..")).toContainText("20");
  await position.getByLabel("Prix du stop loss").fill("abc");
  await expect(position.getByText(/Renseignez tous les champs/)).toBeVisible();
});

test("le calculateur de rendement/risque refuse un plan incohérent", async ({ page }) => {
  await page.goto("/outils/");
  const rr = page.locator("#rendement-risque");
  await expect(rr.getByText("Ratio rendement/risque").locator("..")).toContainText("2,00 R");
  await rr.getByLabel("Stop loss").fill("52");
  await expect(rr.getByText(/le stop doit être sous l'entrée/)).toBeVisible();
});

test("le calculateur d'espérance donne la probabilité exacte de série de pertes", async ({ page }) => {
  await page.goto("/outils/");
  const e = page.locator("#esperance");
  await expect(e.getByText("Espérance par trade").locator("..")).toContainText("+0,20 R");
  await expect(e.getByText("Probabilité d'au moins 6 pertes d'affilée").locator("..")).toContainText("87,3 %");
});

test("la recherche trouve un terme et y mène", async ({ page, isMobile }) => {
  await page.goto("/");
  const champ = page.getByRole("searchbox", { name: "Rechercher dans Méridien" });
  // Le raccourci n'existe qu'une fois la page hydratée : on réessaie jusqu'à l'ouverture.
  await expect(async () => {
    if (isMobile) await page.getByRole("button", { name: "Rechercher" }).click();
    else await page.keyboard.press("Control+k");
    await expect(champ).toBeVisible({ timeout: 1000 });
  }).toPass();
  await champ.fill("levier");
  const resultats = page.getByRole("list", { name: "Résultats" });
  await expect(resultats.getByRole("button").first()).toBeVisible();
  await resultats.getByRole("button", { name: /Effet de levier/ }).click();
  await expect(page).toHaveURL(/\/glossaire\/effet-de-levier\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Effet de levier");
});

test("les réglages appliquent la palette daltonien et refusent un faux fichier", async ({ page }) => {
  await page.goto("/parametres/");
  await page.getByRole("button", { name: "Bleu et orange" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "daltonien");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "daltonien");

  const telechargement = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exporter ma progression" }).click();
  expect((await telechargement).suggestedFilename()).toMatch(/^meridien-progression-\d{4}-\d{2}-\d{2}\.json$/);

  await page.locator('input[type="file"]').setInputFiles({ name: "faux.json", mimeType: "application/json", buffer: Buffer.from('{"bonjour":1}') });
  await expect(page.getByText(/n'est pas une progression Méridien valide/)).toBeVisible();
});

test("sur mobile, la navigation est en bas de l'écran", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Vérification propre au mobile");
  await page.goto("/");
  await expect(page.locator("aside").first()).toBeHidden();
  const barre = page.getByRole("navigation", { name: "Navigation principale" }).last();
  await expect(barre).toBeVisible();
  await barre.getByRole("link", { name: "Outils" }).click();
  await expect(page).toHaveURL(/\/outils\/$/);
});
