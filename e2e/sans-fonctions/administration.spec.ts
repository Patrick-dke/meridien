import { expect, test, type Page } from "@playwright/test";
import { CODE_ACTIVATION_TEST, COMPTES_TEST } from "../../scripts/emulateurs/comptes";

/**
 * Administration sans fonctions serveur, comme en production sur l'offre gratuite de Firebase : site construit
 * avec NEXT_PUBLIC_EMULATEURS=1 et NEXT_PUBLIC_EMULATEURS_SANS_FONCTIONS=1 dans out-sans-fonctions/, émulateurs Auth et Firestore
 * seulement. npm run e2e:sans-fonctions. Rien de tout cela ne touche la production.
 */
async function connecter(page: Page, compte: { email: string; motDePasse: string }, suite: string) {
  await page.goto(`/connexion/?suite=${encodeURIComponent(suite)}`);
  await page.getByLabel("Adresse e-mail").fill(compte.email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(compte.motDePasse);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

/** Les actions sensibles demandent un motif (fenêtre du navigateur) : il est inscrit au journal d'audit. */
const repondreMotif = (page: Page, motif: string) => page.once("dialog", (d) => void d.accept(motif));

test.describe.configure({ mode: "serial" });

test("sans droit, l'apprenant trouve le chapitre payant verrouillé", async ({ page }) => {
  await connecter(page, COMPTES_TEST.apprenant, "/chapitre/rejets-et-meches/");
  await expect(page.getByRole("heading", { name: /Ce chapitre fait partie du module/ })).toBeVisible({ timeout: 30_000 });
});

test("l'administrateur accorde un module à un apprenant, avec un motif inscrit au journal", async ({ page }) => {
  test.setTimeout(90_000);
  await connecter(page, COMPTES_TEST.admin, "/admin/");
  await expect(page.getByText("Administration sans fonctions serveur")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("tab", { name: "Paiements" })).toHaveCount(0);
  await page.getByRole("tab", { name: "Utilisateurs" }).click();
  await page.getByLabel("Rechercher un utilisateur").fill("awa");
  await page.getByLabel("Rechercher un utilisateur").press("Enter");
  await page.getByRole("button", { name: "Awa Test" }).click();
  const fiche = page.getByRole("region", { name: "Fiche utilisateur" });
  await expect(fiche.getByText("Aucun module payant débloqué.")).toBeVisible();
  await fiche.getByLabel("Module à accorder").selectOption("price-action");
  repondreMotif(page, "Partenariat de test");
  await fiche.getByRole("button", { name: "Accorder l'accès" }).click();
  await expect(fiche.getByText("Fait. L'action est inscrite au journal d'audit.")).toBeVisible({ timeout: 20_000 });
  await expect(fiche.getByText(/administration ·/)).toBeVisible();
  await page.getByRole("tab", { name: "Journal d'audit" }).click();
  await expect(page.getByText("droit.accorde").first()).toBeVisible();
  await expect(page.getByText("Partenariat de test").first()).toBeVisible();
});

test("l'apprenant lit le module accordé", async ({ page }) => {
  await connecter(page, COMPTES_TEST.apprenant, "/chapitre/rejets-et-meches/");
  await expect(page.getByText(/Étape 1 sur \d+ · Introduction/)).toBeVisible({ timeout: 30_000 });
});

test("l'administrateur ouvre tous les modules payants sans les acheter", async ({ page }) => {
  await connecter(page, COMPTES_TEST.admin, "/chapitre/cbdr/");
  await expect(page.getByText(/Étape 1 sur \d+ · Introduction/)).toBeVisible({ timeout: 30_000 });
  await page.goto("/formations/liquidite-ict/");
  await expect(page.getByText("Débloqué").first()).toBeVisible({ timeout: 20_000 });
});

test("l'administrateur règle un prix, que le site affiche aussitôt", async ({ page }) => {
  await connecter(page, COMPTES_TEST.admin, "/admin/#modules");
  const champ = page.getByLabel("Prix de Price Action");
  await expect(champ).toBeVisible({ timeout: 30_000 });
  await champ.fill("45000");
  repondreMotif(page, "Ajustement de test");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifié et journalisé.")).toBeVisible({ timeout: 20_000 });
  await page.goto("/formations/");
  await expect(page.getByText("45 000 FCFA").first()).toBeVisible({ timeout: 20_000 });
});

test("l'administrateur révoque l'accès : le chapitre se verrouille de nouveau", async ({ page }) => {
  await connecter(page, COMPTES_TEST.admin, "/admin/#utilisateurs");
  await page.getByLabel("Rechercher un utilisateur").fill("awa", { timeout: 30_000 });
  await page.getByLabel("Rechercher un utilisateur").press("Enter");
  await page.getByRole("button", { name: "Awa Test" }).click();
  const fiche = page.getByRole("region", { name: "Fiche utilisateur" });
  repondreMotif(page, "Fin du partenariat de test");
  await fiche.getByRole("button", { name: "Révoquer" }).click();
  await expect(fiche.getByText("Fait. L'action est inscrite au journal d'audit.")).toBeVisible({ timeout: 20_000 });
  await expect(fiche.getByText("Aucun module payant débloqué.")).toHaveCount(0);
});

test("après la révocation, le chapitre de l'apprenant se verrouille de nouveau", async ({ page }) => {
  await connecter(page, COMPTES_TEST.apprenant, "/chapitre/rejets-et-meches/");
  await expect(page.getByRole("heading", { name: /Ce chapitre fait partie du module/ })).toBeVisible({ timeout: 30_000 });
});

/** Partie d'un fichier de publication, au format de npm run contenus:preparer. */
const partie = (nom: string, contenu: Record<string, unknown>) => ({
  name: nom,
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify({ version: "e2e-reprise", contenus: [], corriges: [], narrations: [], ...contenu })),
});
const PARTIE_1 = partie("partie-1-sur-2.json", {
  contenus: [{ slug: "essai-publication", module: "price-action", titre: "Essai", chapitre: { titre: "Essai" }, scenes: {} }],
});
const PARTIE_2 = partie("partie-2-sur-2.json", {
  corriges: [{ slug: "essai-publication", module: "price-action", quiz: [] }],
  narrations: [{ slug: "essai-publication", module: "price-action", morceaux: ["QUJD"] }],
});

test("publication des contenus en plusieurs parties : après une coupure, rien n'est renvoyé deux fois", async ({ page }) => {
  test.setTimeout(90_000);
  await connecter(page, COMPTES_TEST.admin, "/admin/#contenus");
  const fichiers = page.locator('input[type="file"]');
  await expect(fichiers).toBeAttached({ timeout: 30_000 });
  // Première tentative interrompue : seule la première partie est arrivée.
  await fichiers.setInputFiles([PARTIE_1]);
  await expect(page.getByText(/Publication e2e-reprise terminée : 1 chapitres, 0 narrations/)).toBeVisible({ timeout: 20_000 });
  // Reprise avec toutes les parties : le chapitre déjà publié n'est pas renvoyé.
  await fichiers.setInputFiles([PARTIE_1, PARTIE_2]);
  await expect(page.getByText(/2 documents envoyés, 1 déjà publiés/)).toBeVisible({ timeout: 20_000 });
  await fichiers.setInputFiles([PARTIE_1, PARTIE_2]);
  await expect(page.getByText("Rien à envoyer : la version e2e-reprise de ces fichiers est déjà entièrement publiée.")).toBeVisible({ timeout: 20_000 });
});

test("le premier administrateur s'active lui-même avec le code à usage unique", async ({ page }) => {
  test.setTimeout(90_000);
  await connecter(page, COMPTES_TEST.activation, "/admin/");
  const champ = page.getByLabel("Code d'activation");
  await expect(champ).toBeVisible({ timeout: 30_000 });
  await champ.fill("MRDN-FAUX-CODE");
  await page.getByRole("button", { name: "Activer mon accès administrateur" }).click();
  await expect(page.getByText(/Activation refusée/)).toBeVisible({ timeout: 20_000 });
  await champ.fill(CODE_ACTIVATION_TEST);
  await page.getByRole("button", { name: "Activer mon accès administrateur" }).click();
  await expect(page.getByRole("tab", { name: "Modules et prix" })).toBeVisible({ timeout: 30_000 });
});
