import { defineConfig } from "vitest/config";

// Tests des règles Firestore : à lancer dans l'émulateur (npm run test:regles).
export default defineConfig({
  test: { include: ["tests/regles/**/*.test.ts"], environment: "node", testTimeout: 20000, fileParallelism: false },
});
