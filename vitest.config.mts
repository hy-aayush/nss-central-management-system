import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the database integration tests.
 *
 * These tests talk to real PostgreSQL through `TEST_ADMIN_DATABASE_URL`; they
 * do not mock the driver or the constraints. Files run one at a time because
 * every file creates and drops a scratch database on the same local server and
 * sets the cluster-wide `app_user` password.
 *
 * `npm run test:db` is the only entry point. See docs/DATABASE.md for the
 * disposable PostgreSQL command.
 *
 * The `.mts` extension keeps Vite from warning that an ESM config was loaded
 * as CommonJS; the root `package.json` has no `"type": "module"`.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // A scratch database migration plus security.sql takes a couple of seconds.
    testTimeout: 30_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    sequence: { concurrent: false },
  },
});
