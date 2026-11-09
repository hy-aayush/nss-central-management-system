#!/usr/bin/env node
/**
 * Client JavaScript budget.
 *
 * Next 16 + Turbopack does not print per-route sizes, so the only honest number
 * available after a build is the shipped payload itself: every JS file under
 * `.next/static`, measured gzipped (what the browser actually downloads).
 *
 * The budget is deliberately a ceiling rather than a target. It exists so a new
 * dependency or an accidentally imported server module fails a check instead of
 * quietly adding a few hundred kilobytes to a mobile first load.
 *
 * Usage:
 *   node scripts/js-budget.mjs            # enforce the default budget
 *   node scripts/js-budget.mjs --budget=820
 *   JS_BUDGET_KB=820 npm run budget
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const DEFAULT_BUDGET_KB = 820;
const STATIC_DIR = join(process.cwd(), ".next", "static");

const argBudget = process.argv
  .find((arg) => arg.startsWith("--budget="))
  ?.slice("--budget=".length);
const budgetKb = Number(argBudget ?? process.env.JS_BUDGET_KB ?? DEFAULT_BUDGET_KB);

if (!Number.isFinite(budgetKb) || budgetKb <= 0) {
  console.error(`Invalid budget: ${argBudget ?? process.env.JS_BUDGET_KB}`);
  process.exit(2);
}

if (!existsSync(STATIC_DIR)) {
  console.error(
    "No .next/static found. Run `npm run build` first (a dev server overwrites it).",
  );
  process.exit(2);
}

// A development build has no BUILD_ID, and its chunks are neither minified nor
// split the way a deployment is. Measuring one would report a number that is
// not what users download.
if (!existsSync(join(process.cwd(), ".next", "BUILD_ID"))) {
  console.error(
    "No .next/BUILD_ID: this is a development build. Run `npm run build`, then measure.",
  );
  process.exit(2);
}

/** @param {string} dir */
function collect(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collect(full));
    else if (entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

const files = collect(STATIC_DIR);
const measured = files
  .map((file) => ({
    path: relative(process.cwd(), file).replaceAll("\\", "/"),
    kb: gzipSync(readFileSync(file)).length / 1024,
  }))
  .sort((a, b) => b.kb - a.kb);

const totalKb = measured.reduce((sum, file) => sum + file.kb, 0);
const largest = measured.slice(0, 5);

console.log(`Client JS: ${totalKb.toFixed(1)} KB gzip across ${files.length} chunks`);
console.log(`Budget:    ${budgetKb.toFixed(1)} KB`);
for (const file of largest) {
  console.log(`  ${file.kb.toFixed(1).padStart(7)} KB  ${file.path}`);
}

const headroom = budgetKb - totalKb;
if (headroom < 0) {
  console.error(
    `\nOver budget by ${Math.abs(headroom).toFixed(1)} KB. Remove the growth or raise the budget deliberately.`,
  );
  process.exit(1);
}

console.log(`\nWithin budget (${headroom.toFixed(1)} KB headroom).`);
