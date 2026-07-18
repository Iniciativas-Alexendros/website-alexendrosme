import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: ["lib/**/*.test.ts", "lib/**/index.ts", "lib/i18n/dictionaries/*.ts"],
      reporter: ["text", "lcov", "html", "json-summary"],
      // Baseline measured 2026-07-18: lines 60.77, statements 59.37,
      // functions 56.33, branches 51.40. Floor = baseline - 5.
      thresholds: {
        lines: 55,
        statements: 54,
        functions: 51,
        // branches excluded intentionally (51.40 baseline < 60; tracked as
        // TECH-DEBT: raise to ≥60 in v0.6 by adding tests for loader + context)
      },
    },
  },
});
