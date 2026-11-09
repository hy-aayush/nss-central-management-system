/**
 * Token contrast audit.
 *
 * Reads the theme blocks in src/app/globals.css, converts every oklch() value to
 * sRGB and reports WCAG contrast for the text/background pairs the design system
 * actually uses. Run with: node scripts/contrast-audit.mjs
 *
 * Only pairs that carry text matter here: borders and elevation shadows are
 * non-text contrast and are judged at 3:1 by the UI spec, not 4.5:1.
 */
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function themeBlock(selector) {
  // Match the rule itself, not a mention of it in a comment or a nested rule.
  const rule = new RegExp(`^${selector.replace(".", "\\.")}\\s*\\{`, "m");
  const match = rule.exec(css);
  if (!match) return {};
  const start = match.index;
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  const body = css.slice(open + 1, close);
  const tokens = {};
  for (const line of body.split("\n")) {
    const match = line.match(/^\s*(--[\w-]+):\s*([^;]+);/);
    if (match) tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

function parseColor(value) {
  const oklch = value.match(
    /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/,
  );
  if (!oklch) return null;
  const l = parseFloat(oklch[1]) > 1 ? parseFloat(oklch[1]) / 100 : parseFloat(oklch[1]);
  return {
    l,
    c: parseFloat(oklch[2]),
    h: parseFloat(oklch[3]),
    alpha: oklch[4] ? parseFloat(oklch[4]) : 1,
  };
}

/** oklch -> linear sRGB (Björn Ottosson's matrices). */
function toLinearRgb({ l, c, h }) {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;

  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ].map((v) => Math.min(1, Math.max(0, v)));
}

function luminance(color) {
  const [r, g, b] = toLinearRgb(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS = [
  ["--foreground", "--background"],
  ["--foreground", "--card"],
  ["--muted-foreground", "--background"],
  ["--muted-foreground", "--card"],
  ["--muted-foreground", "--surface-container-low"],
  ["--primary", "--background"],
  ["--primary-foreground", "--primary"],
  ["--success", "--card"],
  ["--warning", "--card"],
  ["--error", "--card"],
];

const LARGE_TEXT_MIN = 3;
const TEXT_MIN = 4.5;

let failures = 0;

for (const [name, selector] of [
  ["light", ":root"],
  ["dark", ".dark"],
]) {
  const tokens = themeBlock(selector);
  console.log(`\n${name} theme`);
  for (const [fgToken, bgToken] of PAIRS) {
    const fg = parseColor(tokens[fgToken] ?? "");
    const bg = parseColor(tokens[bgToken] ?? "");
    if (!fg || !bg) {
      console.log(`  ${fgToken} on ${bgToken}: skipped (non-hexegonal value)`);
      continue;
    }
    const ratio = contrast(fg, bg);
    const ok = ratio >= TEXT_MIN;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2)}:1  ${fgToken} on ${bgToken}` +
        (ok ? "" : `  (below ${TEXT_MIN}:1 body-text minimum)`),
    );
  }
  void LARGE_TEXT_MIN;
}

console.log(
  failures === 0
    ? "\nAll audited text pairs meet WCAG AA for body text."
    : `\n${failures} pair(s) below AA for body text.`,
);

process.exit(failures === 0 ? 0 : 1);
