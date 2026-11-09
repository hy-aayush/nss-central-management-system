import { expect, test } from "@playwright/test";

/**
 * The four failures worth failing a deploy over:
 *   1. the sign-in shell renders,
 *   2. an unauthenticated visitor is redirected, not served,
 *   3. an authenticated office route renders a real table,
 *   4. the metrics endpoint rejects a foreign origin.
 *
 * Everything asserted here was already true; the value is that it stays true.
 */

test("login shell renders without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByLabel(/roll number/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /sign in with test account/i }),
  ).toBeVisible();

  expect(errors).toEqual([]);
});

test("an unauthenticated office route redirects to sign-in", async ({ page }) => {
  await page.goto("/volunteers");
  await expect(page).toHaveURL(/\/login\?next=%2Fvolunteers/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("the volunteer table keeps its semantics", async ({ page, context }) => {
  await context.addCookies([
    { name: "nss_dev_test_session", value: "23053436", domain: "localhost", path: "/" },
  ]);

  await page.goto("/volunteers");

  const table = page.getByRole("table").first();
  await expect(table).toBeVisible();

  // A caption is the table's accessible name; a grid without one is announced
  // as an unlabelled table, which is the failure this test guards.
  await expect(table.locator("caption")).toHaveCount(1);
  expect(await table.getByRole("columnheader").count()).toBeGreaterThan(3);
  await expect(page.getByRole("row").nth(1)).toBeVisible();
});

test("the metrics endpoint rejects a foreign origin", async ({ request }) => {
  // Signed in on purpose: without a session the proxy answers 307 to /login and
  // the origin check never runs, which would make this test pass for the wrong
  // reason (a followed redirect lands on a 200).
  const response = await request.post("/api/vitals", {
    headers: {
      origin: "https://example.test",
      cookie: "nss_dev_test_session=23053436",
    },
    data: { path: "/volunteers", lcp: 1200 },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(403);
});

test("a hidden column from the URL is not rendered", async ({ page, context }) => {
  await context.addCookies([
    { name: "nss_dev_test_session", value: "23053436", domain: "localhost", path: "/" },
  ]);

  await page.goto("/volunteers?hide=domains");

  await expect(page.getByRole("table").first()).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: /creative domains/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("columnheader", { name: /volunteer/i }).first(),
  ).toBeVisible();
});

test("the columns menu hides a column and records it in the URL", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "nss_dev_test_session", value: "23053436", domain: "localhost", path: "/" },
  ]);

  await page.goto("/volunteers");

  await page.getByRole("button", { name: /columns/i }).click();
  await page.getByRole("menuitemcheckbox", { name: /academic year/i }).click();

  await expect(page).toHaveURL(/hide=/);
  await expect(
    page.getByRole("columnheader", { name: /academic year/i }),
  ).toHaveCount(0);
});
