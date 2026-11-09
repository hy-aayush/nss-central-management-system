#!/usr/bin/env node
/**
 * Style-sheet composition audit.
 *
 * Answers the question a raw file size cannot: where does the sheet's weight
 * come from, and is any of it dead? Run it after `npm run build`; it reads the
 * emitted CSS, not the sources, so anything it reports is genuinely shipped.
 *
 * The two numbers that matter when judging a change:
 *   - gzip bytes, because that is what crosses the network;
 *   - dark-scoped share, because a themed surface emits every utility twice and
 *     that is the main structural cost in this design system.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const DIR = join(process.cwd(), ".next", "static", "chunks");

if (!readdirSync(process.cwd()).includes(".next")) {
  console.error("Run `npm run build` first.");
  process.exit(2);
}

/** Splits a stylesheet into its top-level blocks. */
function topLevelBlocks(css) {
  const blocks = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        blocks.push(css.slice(start, index + 1));
        start = index + 1;
      }
    }
  }

  return blocks;
}

const kB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const files = readdirSync(DIR).filter((file) => file.endsWith(".css"));
let rawTotal = 0;
let gzipTotal = 0;

for (const file of files) {
  const css = readFileSync(join(DIR, file), "utf8");
  const raw = Buffer.byteLength(css);
  const gzip = gzipSync(css).length;
  rawTotal += raw;
  gzipTotal += gzip;

  const blocks = topLevelBlocks(css);
  const mediaBlocks = blocks.filter((block) => block.trim().startsWith("@media"));
  const declarations = css.match(/--[a-z0-9-]+:[^;]+;/g) ?? [];
  // Dark utilities live *inside* the utilities layer, so counting them by
  // occurrence is the only honest measure of how much of the sheet is a second
  // copy of itself for the `.dark` colour scheme.
  const darkOccurrences = (css.match(/\.dark(?=[\s:.{\[])/g) ?? []).length;
  const ruleCount = (css.match(/\{/g) ?? []).length;

  console.log(`\n${file}`);
  console.log(`  ${kB(raw)} raw · ${kB(gzip)} gzip · ${blocks.length} top-level blocks, ${ruleCount} brace groups`);
  console.log(`  .dark occurrences: ${darkOccurrences}`);
  console.log(`  @media: ${mediaBlocks.length} blocks`);
  console.log(
    `  custom properties: ${declarations.length} declarations, ${kB(Buffer.byteLength(declarations.join("")))}`,
  );

  const largest = blocks
    .map((block) => [Buffer.byteLength(block), block.slice(0, 80).replace(/\s+/g, " ")])
    .sort((a, b) => b[0] - a[0])
    .slice(0, 5);

  console.log("  largest blocks:");
  for (const [bytes, head] of largest) console.log(`    ${kB(bytes).padStart(9)}  ${head}`);
}

console.log(`\nTotal CSS: ${kB(rawTotal)} raw · ${kB(gzipTotal)} gzip across ${files.length} files`);
