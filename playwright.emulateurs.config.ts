import { defineConfig, devices } from "@playwright/test";

/**
 * Parcours commercial contre l'environnement de TEST : site construit avec NEXT_PUBLIC_EMULATEURS=1 dans
 * out-test/, émulateurs lancés et amorcés (npm run emulateurs, puis npm run emulateurs:amorcer).
 */
export default defineConfig({
  testDir: "e2e/emulateurs",
  retries: 0,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4175", locale: "fr-FR", trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/serve-out.mjs 4175",
    env: { OUT_DIR: "out-test" },
    url: "http://127.0.0.1:4175/",
    reuseExistingServer: false,
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "ordinateur", use: { ...devices["Desktop Chrome"] } },
  ],
});
