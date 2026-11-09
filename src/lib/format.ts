/**
 * Number formatting shared by the office screens.
 *
 * Rates were formatted inline in three panels as `x.toFixed(1)}%`, which meant
 * a value could read 90.4% in one card and 90% in another after someone
 * round-tripped it. One helper keeps the rounding rule in one place, and drops
 * the trailing `.0` that a fixed-place formatter leaves behind (92%, not 92.0%).
 */
export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";

  const fixed = value.toFixed(digits);
  const trimmed = fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
  return `${trimmed}%`;
}
