import { defineConfig } from "vitest/config";

// Parcours complet contre les émulateurs (auth, Firestore, fonctions) : npm run test:fonctions.
export default defineConfig({
  test: { include: ["tests/fonctions/**/*.test.ts"], environment: "node", testTimeout: 30000, hookTimeout: 30000, fileParallelism: false, sequence: { concurrent: false } },
});
