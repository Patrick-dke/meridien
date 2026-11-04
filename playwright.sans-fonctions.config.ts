import { defineConfig, devices } from "@playwright/test";

/**
 * Administration sans fonctions serveur (offre gratuite de Firebase) : site construit avec NEXT_PUBLIC_EMULATEURS=1
 * et NEXT_PUBLIC_EMULATEURS_SANS_FONCTIONS=1 dans out-sans-fonctions/, émulateurs Auth et Firestore lancés et amorcés.
 */
export default defineConfig({
  testDir: "e2e/sans-fonctions",
  retries: 0,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4176", locale: "fr-FR", trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/serve-out.mjs 4176",
    env: { OUT_DIR: "out-sans-fonctions" },
    url: "http://127.0.0.1:4176/",
    reuseExistingServer: false,
  },
  projects: [{ name: "ordinateur", use: { ...devices["Desktop Chrome"] } }],
});
