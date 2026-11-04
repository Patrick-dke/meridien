import { expect, test, type Page } from "@playwright/test";
import { COMPTES_TEST } from "../../scripts/emulateurs/comptes";
import { repondreQuizChapitre1 } from "../aides";

/**
 * Parcours commercial dans l'environnement de TEST (site construit avec NEXT_PUBLIC_EMULATEURS=1, émulateurs
 * amorcés, paiements simulés) : npm run e2e:emulateurs. Rien de tout cela ne touche la production.
 */
const AUTH = "http://127.0.0.1:9099";
const PROJET = "demo-meridien";
/**
 * Attente de la session après un chargement complet de page. Sur mobile, Firebase Auth charge d'abord la
 * bibliothèque Google de connexion (apis.google.com) et n'ouvre la session qu'ensuite : de quelques secondes à
 * plus de 30 s selon le réseau, à chaque chargement complet dans un navigateur de test sans cache.
 */
const SESSION = 90_000;

/** Ouvre le lien de vérification reçu, comme l'apprenant depuis sa boîte mail (l'envoi suit la création du compte). */
async function verifierAdresse(page: Page, email: string) {
  let lien: string | undefined;
  await expect
    .poll(
      async () => {
        const codes = (await (await fetch(`${AUTH}/emulator/v1/projects/${PROJET}/oobCodes`)).json()) as { oobCodes: { email: string; requestType: string; oobLink: string }[] };
        lien = codes.oobCodes.filter((c) => c.email === email && c.requestType === "VERIFY_EMAIL").at(-1)?.oobLink;
        return Boolean(lien);
      },
      { message: "lien de vérification envoyé", timeout: 20_000 },
    )
    .toBe(true);
  await page.goto(lien!);
}

async function connecter(page: Page, compte: { email: string; motDePasse: string }, suite: string) {
  await page.goto(`/connexion/?suite=${encodeURIComponent(suite)}`);
  await page.getByLabel("Adresse e-mail").fill(compte.email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(compte.motDePasse);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

test.describe.configure({ mode: "serial" });

test("un apprenant connecté valide le premier chapitre gratuit par le quiz, noté par le serveur", async ({ page }) => {
  test.setTimeout(240_000);
  await connecter(page, COMPTES_TEST.apprenant, "/chapitre/quest-ce-que-le-trading/#etape-quiz");
  await expect(page.getByText("Question 1 sur")).toBeVisible({ timeout: SESSION });
  await repondreQuizChapitre1(page);
  await expect(page.getByText("100 %").first()).toBeVisible();
  await expect(page.getByText("Résultat officiel enregistré sur ton compte.")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("link", { name: "Voir la validation du chapitre" }).click();
  await expect(page.getByText("Chapitre validé", { exact: true })).toBeVisible();
  await page.goto("/tableau-de-bord/");
  await expect(page.getByText("1/14").first()).toBeVisible({ timeout: SESSION });
});

test("un quiz raté ne valide pas le chapitre et déclenche une recommandation", async ({ page }) => {
  test.setTimeout(240_000);
  await connecter(page, COMPTES_TEST.apprenant, "/chapitre/trading-et-investissement/");
  await expect(page).toHaveURL(/\/chapitre\/trading-et-investissement\/$/, { timeout: SESSION });
  await page.goto("/chapitre/quest-ce-que-le-trading/#etape-quiz");
  await expect(page.getByText("Question 1 sur")).toBeVisible({ timeout: SESSION });
  await repondreQuizChapitre1(page, false);
  await expect(page.getByText(/Il faut 80 %/)).toBeVisible();
  await page.goto("/tableau-de-bord/");
  await expect(page.getByText(/réponses? manquées?/).first()).toBeVisible({ timeout: SESSION });
});

test("examen de fin de module : copie sans corrigé, puis correction détaillée et chapitres à revoir", async ({ page }) => {
  test.setTimeout(240_000);
  await connecter(page, COMPTES_TEST.apprenant, "/examen/premiers-pas/");
  await page.getByRole("button", { name: /Commencer l'examen|Repasser l'examen|Reprendre/ }).click({ timeout: SESSION });
  await expect(page.getByText(/Question 1 sur \d+/)).toBeVisible({ timeout: 30_000 });
  // Pendant l'examen, aucune correction : le navigateur n'a pas le corrigé.
  await expect(page.getByText("Réponse attendue")).toHaveCount(0);
  await page.getByRole("navigation", { name: "Questions de l'examen" }).getByRole("button").last().click();
  await page.getByRole("button", { name: "Rendre ma copie" }).click();
  await expect(page.getByText(/^\d+ questions? sans réponse$/)).toBeVisible();
  await page.getByRole("button", { name: "Rendre quand même" }).click();
  await expect(page.getByRole("heading", { name: "Correction détaillée" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Par niveau" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "À revoir en priorité" })).toBeVisible();
  await page.locator("details summary").first().click();
  await expect(page.getByText("Réponse attendue :").first()).toBeVisible();
});

test("un visiteur voit les prix venus de la base et un chapitre payant verrouillé", async ({ page }) => {
  await page.goto("/formations/");
  await expect(page.getByText("40 000 FCFA").first()).toBeVisible();
  await page.goto("/chapitre/rejets-et-meches/");
  await expect(page.getByRole("heading", { name: /Ce chapitre fait partie du module/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Voir le module et son prix" })).toBeVisible();
});

test("sans compte, le quiz d'un chapitre gratuit invite à créer un compte", async ({ page }) => {
  await page.goto("/chapitre/formation-des-prix/#etape-quiz");
  await expect(page.getByText("Crée ton compte gratuit pour passer le quiz")).toBeVisible();
});

test("inscription, vérification, paiement échoué puis réussi, chapitre débloqué", async ({ page }) => {
  test.setTimeout(360_000);
  const email = `e2e-${Date.now()}@meridien.test`;
  await page.goto("/inscription/?suite=%2Fpaiement%2F%3Fmodule%3Dsmart-money-concepts");
  await page.getByLabel("Nom complet").fill("Test Navigateur");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Téléphone (Cameroun)").fill("6 70 00 00 01");
  await page.getByLabel("Mot de passe", { exact: true }).fill("Navigateur-test-2026");
  await page.getByLabel("Confirmation du mot de passe").fill("Navigateur-test-2026");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page.getByRole("heading", { name: "Vérifie d'abord ton adresse e-mail" })).toBeVisible({ timeout: SESSION });

  await verifierAdresse(page, email);
  await page.goto("/paiement/?module=smart-money-concepts");
  // Le jeton de session est aussi renouvelé pour porter l'adresse vérifiée.
  await expect(page.getByText("Environnement de test : aucun argent réel ne circule.")).toBeVisible({ timeout: SESSION });
  await expect(page.getByText("50 000 FCFA").first()).toBeVisible();

  // Échec : numéro de test se terminant par 1.
  await page.getByRole("button", { name: /MTN Mobile Money/ }).click();
  await expect(page.getByLabel("Numéro MTN qui paie")).toHaveValue("6 70 00 00 01");
  await page.getByRole("button", { name: /Payer 50 000 FCFA/ }).click();
  await expect(page.getByRole("heading", { name: "Valide le paiement sur ton téléphone" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Paiement non abouti" })).toBeVisible({ timeout: 60_000 });

  // Réussite : numéro de test se terminant par 0.
  await page.getByRole("button", { name: "Réessayer" }).click();
  await page.getByRole("button", { name: /MTN Mobile Money/ }).click();
  await page.getByLabel("Numéro MTN qui paie").fill("670000000");
  await page.getByRole("button", { name: /Payer 50 000 FCFA/ }).click();
  await expect(page.getByRole("heading", { name: "Paiement confirmé" })).toBeVisible({ timeout: 60_000 });

  await page.getByRole("link", { name: "Commencer le module" }).click();
  await expect(page.getByText(/Étape 1 sur \d+ · Introduction/)).toBeVisible({ timeout: 20_000 });
  await page.goto("/compte/");
  await expect(page.getByText("Payé")).toBeVisible({ timeout: SESSION });
  await expect(page.getByText("Échoué")).toBeVisible();
});

test("l'administration est réservée et montre les paiements de test à part", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto("/admin/");
  await expect(page.getByText("Accès réservé à l'administration.")).toBeVisible({ timeout: SESSION });
  await page.goto("/connexion/?suite=%2Fadmin%2F");
  await page.getByLabel("Adresse e-mail").fill(COMPTES_TEST.admin.email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(COMPTES_TEST.admin.motDePasse);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Encaissement : ")).toContainText("simulation", { timeout: SESSION });
  await expect(page.getByText("Encaissé (production)")).toBeVisible();
  await page.getByRole("tab", { name: "Journal d'audit" }).click();
  await expect(page.getByText("paiement.confirme").first()).toBeVisible();
});
