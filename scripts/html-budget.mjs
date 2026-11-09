#!/usr/bin/env node
/**
 * Document-weight budget.
 *
 * The client-JS budget measures what the browser must parse; this measures what
 * the server actually sends for a page — HTML plus the inlined RSC payload. The
 * two can diverge wildly: a page can ship 40 KB of JS and a 300 KB document
 * because a server component serialised a large list.
 *
 * Run it against a server you can authenticate to:
 *
 *   BASE_URL=http://localhost:3000 \
 *   SMOKE_COOKIE="nss_dev_test_session=23053436" \
 *   node scripts/html-budget.mjs
 *
 * A development server inflates every number (segment explorer, unminified RSC),
 * so treat the dev figure as a ceiling and the deployment figure as the truth.
 */

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const COOKIE = process.env.SMOKE_COOKIE ?? "";
const BUDGET_KB = Number(process.env.HTML_BUDGET_KB ?? "420");

const ROUTES = [
  "/login",
  "/dashboard",
  "/volunteers",
  "/events",
  "/audit",
  "/hours",
  "/analytics",
];

if (!Number.isFinite(BUDGET_KB) || BUDGET_KB <= 0) {
  console.error("HTML_BUDGET_KB must be a positive number.");
  process.exit(2);
}

const results = [];
let failures = 0;

for (const route of ROUTES) {
  const url = new URL(route, BASE);
  const response = await fetch(url, {
    headers: COOKIE ? { cookie: COOKIE } : undefined,
    redirect: "manual",
  });

  const body = Buffer.from(await response.arrayBuffer());
  const gzip = Number(
    (await import("node:zlib")).gzipSync(body).length / 1024,
  );

  const over = gzip > BUDGET_KB;
  if (over) failures += 1;

  results.push({ route, status: response.status, gzip, over });
}

results.sort((a, b) => b.gzip - a.gzip);

console.log(`Document weight (gzip) · budget ${BUDGET_KB.toFixed(0)} KB · ${BASE}\n`);
for (const result of results) {
  const mark = result.over ? "OVER" : " ok ";
  console.log(
    `  ${mark} ${result.gzip.toFixed(1).padStart(7)} KB  ${String(result.status)}  ${result.route}`,
  );
}

const statuses = results.map((result) => result.status);
if (statuses.some((status) => status >= 400)) {
  console.error("\nA route answered with an error; sign in first or fix BASE_URL.");
  process.exit(2);
}

console.log(
  failures === 0
    ? "\nAll documents within budget."
    : `\n${failures} document(s) over budget.`,
);

process.exit(failures === 0 ? 0 : 1);
