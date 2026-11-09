#!/usr/bin/env node
/**
 * Chunk-level bundle diff.
 *
 * A total byte count tells you the payload grew; it does not tell you *which*
 * chunk grew, which is the only part that leads to a fix. This compares the
 * current build against a saved baseline, per chunk, gzipped:
 *
 *   node scripts/bundle-diff.mjs --write     # record today's build as baseline
 *   node scripts/bundle-diff.mjs             # compare against it
 *
 * Chunk names are content hashes, so a changed chunk appears as one removal and
 * one addition with identical sizes — expected when any of its source changes.
 * The number that matters is the total delta and the largest single change.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const BASELINE = join(process.cwd(), ".bundle-baseline.json");
const STATIC_DIR = join(process.cwd(), ".next", "static");

if (!existsSync(STATIC_DIR)) {
  console.error("No .next/static. Run `npm run build` first.");
  process.exit(2);
}

function collect(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collect(full));
    else if (entry.name.endsWith(".js")) out.push(full);
  }
  return out;
}

const current = {};
for (const file of collect(STATIC_DIR)) {
  const key = relative(process.cwd(), file).replaceAll("\\", "/");
  current[key] = Number((gzipSync(readFileSync(file)).length / 1024).toFixed(1));
}

const total = Object.values(current).reduce((sum, value) => sum + value, 0);

if (process.argv.includes("--write")) {
  writeFileSync(
    BASELINE,
    `${JSON.stringify({ recordedAt: new Date().toISOString(), total: Number(total.toFixed(1)), chunks: current }, null, 2)}\n`,
  );
  console.log(`Baseline written: ${total.toFixed(1)} KB gzip across ${Object.keys(current).length} chunks.`);
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.log(`No baseline yet. Record one with: node scripts/bundle-diff.mjs --write`);
  console.log(`Current build: ${total.toFixed(1)} KB gzip across ${Object.keys(current).length} chunks.`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
const delta = total - baseline.total;

const added = Object.keys(current).filter((key) => !(key in baseline.chunks));
const removed = Object.keys(baseline.chunks).filter((key) => !(key in current));
const changed = Object.keys(current)
  .filter((key) => key in baseline.chunks && Math.abs(current[key] - baseline.chunks[key]) > 0.1)
  .map((key) => ({ key, from: baseline.chunks[key], to: current[key] }))
  .sort((a, b) => Math.abs(b.to - b.from) - Math.abs(a.to - a.from));

console.log(`Baseline ${baseline.recordedAt.slice(0, 10)}: ${baseline.total.toFixed(1)} KB`);
console.log(`Current:  ${total.toFixed(1)} KB gzip across ${Object.keys(current).length} chunks`);
console.log(`Delta:    ${delta >= 0 ? "+" : ""}${delta.toFixed(1)} KB\n`);

if (changed.length > 0) {
  console.log("Changed chunks:");
  for (const entry of changed.slice(0, 12)) {
    console.log(`  ${(entry.to - entry.from).toFixed(1).padStart(7)} KB  ${entry.key}`);
  }
}
if (added.length > 0) console.log(`\nAdded:   ${added.length} chunk(s)`);
if (removed.length > 0) console.log(`Removed: ${removed.length} chunk(s)`);

// Growth beyond this is treated as a regression to explain, not a warning to
// ignore; the JS budget is the hard failure, this is the diagnosis.
const REGRESSION_KB = Number(process.env.DIFF_REGRESSION_KB ?? "25");
if (delta > REGRESSION_KB) {
  console.error(`\nPayload grew by ${delta.toFixed(1)} KB (limit ${REGRESSION_KB} KB).`);
  process.exit(1);
}

console.log("\nWithin the growth limit.");
