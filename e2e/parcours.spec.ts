import { expect, test, type Page } from "@playwright/test";

/** Répond au quiz du chapitre 1 ; `justes` = false donne de mauvaises réponses aux quatre premières questions. */
async function repondreQuizChapitre1(page: Page, justes = true) {
  const verifierEtSuivre = async (derniere = false) => {
    await page.getByRole("button", { name: "Vérifier" }).click();
    await page.getByRole("button", { name: derniere ? "Voir mon résultat" : "Question suivante" }).click();
  };
  await page.getByRole("radio", { name: justes ? "+60 €" : "+3 €", exact: true }).check();
  await verifierEtSuivre();
  await page.getByRole("radio", { name: justes ? "Vrai" : "Faux", exact: true }).check();
  await verifierEtSuivre();
  await page.getByRole("radio", { name: justes ? "−15 €" : "+15 €", exact: true }).check();
  await verifierEtSuivre();
  for (const motif of justes ? [/longues séries de pertes/, /frais réduisent/, /effet de levier/] : [/deux trades/]) {
    await page.getByRole("checkbox", { name: motif }).check();
  }
  await verifierEtSuivre();
  await page.getByRole("radio", { name: "Faux", exact: true }).check();
  await verifierEtSuivre();
  await page.getByRole("radio", { name: /analyser avec méthode/ }).check();
  await verifierEtSuivre(true);
}

test("un débutant suit l'accueil personnalisé puis valide le premier chapitre", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Apprendre à lire les marchés avec méthode.");
  await page.getByRole("link", { name: "Commencer sans compte" }).click();

  await expect(page).toHaveURL(/\/commencer\/$/);
  await page.getByText("Découvrir", { exact: true }).click();
  await page.getByText("Je pars de zéro").click();
  await page.getByText("20 minutes par jour").click();
  await page.getByRole("button", { name: "Voir mon point de départ" }).click();
  await page.getByRole("link", { name: "Commencer le chapitre 1" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Qu'est-ce que le trading");
  // Parcourir les étapes avec « Continuer » jusqu'au quiz.
  for (const etape of ["Capsule", "Cours", "Illustrations", "Exemple", "Erreurs fréquentes", "Résumé", "Quiz"]) {
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator('section[id^="etape-"]:not([hidden])')).toHaveAttribute("aria-label", etape);
  }
  await repondreQuizChapitre1(page);
  await expect(page.getByText("100 %").first()).toBeVisible();
  await page.getByRole("link", { name: "Voir la validation du chapitre" }).click();
  await expect(page.getByText("Chapitre validé", { exact: true })).toBeVisible();

  // La progression survit au rechargement.
  await page.reload();
  await expect(page.getByText("Chapitre validé", { exact: true })).toBeVisible();

  await page.goto("/tableau-de-bord/");
  await expect(page.getByText("1/14").first()).toBeVisible();
  await expect(page.getByText("Suite du parcours")).toBeVisible();
  await expect(page.getByRole("link", { name: /Trading et investissement/ }).first()).toBeVisible();
});

test("un quiz raté ne valide pas le chapitre et déclenche une recommandation", async ({ page }) => {
  await page.goto("/chapitre/quest-ce-que-le-trading/#etape-quiz");
  await repondreQuizChapitre1(page, false);
  await expect(page.getByText(/Il faut 80 %/)).toBeVisible();
  await page.goto("/chapitre/quest-ce-que-le-trading/#etape-validation");
  await expect(page.getByText("Chapitre pas encore validé")).toBeVisible();
  await page.goto("/tableau-de-bord/");
  await expect(page.getByText(/réponses? manquées?/).first()).toBeVisible();
});

test("la reprise rouvre l'étape où l'apprenant s'était arrêté", async ({ page }) => {
  await page.goto("/chapitre/types-ordres/");
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page).toHaveURL(/#etape-cours$/);
  await page.goto("/chapitre/types-ordres/");
  await expect(page.locator('section[id^="etape-"]:not([hidden])')).toHaveAttribute("aria-label", "Cours");
});

test("une capsule se lit, se met en pause et propose sa transcription", async ({ page }) => {
  await page.goto("/chapitre/stop-loss-take-profit/#etape-capsule");
  await page.getByRole("button", { name: "Lire la capsule" }).click();
  await expect(page.getByRole("button", { name: "Mettre en pause" })).toBeVisible();
  await page.getByRole("button", { name: "Mettre en pause" }).click();
  await page.getByRole("button", { name: "Scène suivante" }).click();
  await page.getByRole("button", { name: "Transcription" }).click();
  await expect(page.getByText("Transcription", { exact: true }).last()).toBeVisible();
  await expect(page.getByText(/Tu risques 2,20 euros par action/).first()).toBeVisible();
});

test("un terme du glossaire s'ouvre dans le cours et se ferme avec Échap", async ({ page }) => {
  await page.goto("/chapitre/couts-du-trading/#etape-cours");
  const terme = page.getByRole("button", { name: "spread", exact: true }).first();
  await terme.click();
  const definition = page.getByRole("dialog", { name: /Définition/ });
  await expect(definition).toBeVisible();
  await expect(definition).toContainText("L'écart entre le prix vendeur");
  await page.keyboard.press("Escape");
  await expect(definition).toBeHidden();
});

test("une adresse inconnue affiche la page 404", async ({ page }) => {
  const reponse = await page.goto("/chapitre/chapitre-imaginaire/");
  expect(reponse?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Cette page n'existe pas" })).toBeVisible();
});
