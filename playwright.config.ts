import { defineConfig, devices } from "@playwright/test";

/** Tests de bout en bout sur le site exporté (npm run build), servi comme en production. */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4174",
    locale: "fr-FR",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve-out.mjs 4174",
    url: "http://localhost:4174/",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "ordinateur", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
