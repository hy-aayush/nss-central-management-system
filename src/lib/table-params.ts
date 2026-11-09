/**
 * One reader for table state that arrives from the address bar.
 *
 * Every table used to parse its own query string inline, which meant each one
 * accepted whatever a hand-edited URL contained: `?size=100000` would render the
 * entire dataset, `?page=-4` produced an empty table, and `?sort=javascript`
 * silently fell back after the fact. Parsing and validation now happen once,
 * against the same allow-lists the controls render, so a shared or edited link
 * can never ask the client to do unbounded work.
 */

/** Anything with a `get`: `URLSearchParams` and Next's read-only variant. */
export interface ParamSource {
  get(name: string): string | null;
}

const MAX_SEARCH_LENGTH = 120;

export function readText(
  params: ParamSource,
  name: string,
  fallback = "",
): string {
  const value = params.get(name);
  if (!value) return fallback;
  return value.slice(0, MAX_SEARCH_LENGTH);
}

export function readEnum<T extends string>(
  params: ParamSource,
  name: string,
  allowed: readonly T[],
  fallback: T | "ALL",
): T | "ALL" {
  const value = params.get(name);
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function readPage(params: ParamSource): number {
  const value = Number.parseInt(params.get("page") ?? "", 10);
  return Number.isFinite(value) && value > 0 ? Math.min(value, 5000) : 1;
}

/** Only the sizes the select actually offers are accepted. */
export function readPageSize(
  params: ParamSource,
  allowed: readonly number[],
  fallback: number,
): number {
  const value = Number.parseInt(params.get("size") ?? "", 10);
  return allowed.includes(value) ? value : fallback;
}

export function readSort<T extends string>(
  params: ParamSource,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = params.get("sort");
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/**
 * A comma-separated list, filtered to known values.
 *
 * Column visibility arrives this way (`?hide=domains,year`) but so would any
 * future multi-value filter, and the rule is the same: unknown entries are
 * dropped rather than trusted, so a hand-edited URL cannot widen the table.
 */
export function readList(
  params: ParamSource,
  name: string,
  allowed: readonly string[],
): string[] {
  const raw = params.get(name);
  if (!raw) return [];

  const values = raw
    .slice(0, 240)
    .split(",")
    .map((value) => value.trim())
    .filter((value) => allowed.includes(value));

  return [...new Set(values)];
}

export function readDirection(
  params: ParamSource,
  fallback: "asc" | "desc",
): "asc" | "desc" {
  const value = params.get("dir");
  return value === "asc" || value === "desc" ? value : fallback;
}
