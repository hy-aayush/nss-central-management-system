import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke config.
 *
 * One browser, one project, one port. The suite exists to catch the failures
 * that matter before a deploy — the shell not rendering, the access gate
 * letting someone through, a table losing its semantics — not to re-test the
 * unit-level logic that vitest already covers.
 *
 * `next dev` is used because the office routes need the development session
 * cookie; the production build refuses it by design.
 */
const PORT = 3111;

// One `next dev` may run per project directory, and a developer usually has one
// on an ephemeral port already. Point the suite at it instead of fighting it:
//   SMOKE_BASE_URL=http://localhost:53461 npm run test:smoke
const EXTERNAL_BASE_URL = process.env.SMOKE_BASE_URL;

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 20_000 },
  reporter: [["list"]],
  use: {
    baseURL: EXTERNAL_BASE_URL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: EXTERNAL_BASE_URL
    ? undefined
    : {
        command: `npx next dev --port ${PORT}`,
        url: `http://localhost:${PORT}/login`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
      },
});
