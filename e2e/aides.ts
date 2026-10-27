import type { Page } from "@playwright/test";

/** Répond au quiz du chapitre 1 ; `justes` = false donne de mauvaises réponses aux quatre premières questions. */
export async function repondreQuizChapitre1(page: Page, justes = true) {
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
