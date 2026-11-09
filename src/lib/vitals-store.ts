/**
 * In-process field-metrics buffer.
 *
 * Deliberately not a database table: a metrics store needs a retention policy
 * and a privacy story before it needs a schema, and neither exists yet. Samples
 * live in this process only, for one hour, and are aggregated to percentiles on
 * read. That is enough to answer "did this deployment get slower", and its
 * limits are stated rather than hidden:
 *
 * - **Per instance.** A serverless deployment has many isolates, so each keeps
 *   its own window. Treat the numbers as a sample, not a census.
 * - **Lost on restart.** Expected; this is a development and canary signal.
 *
 * When a real store lands (item 75's successor), `record` and `summarise` are
 * the only two functions that need to change.
 */

export interface VitalsSample {
  path: string;
  lcp: number;
  cls: number;
  longestEvent: number;
  ttfb: number;
  viewport: string | null;
  connection: string | null;
  env: string | null;
  at: number;
}

const RETENTION_MS = 60 * 60 * 1000;
const MAX_SAMPLES = 500;

const samples: VitalsSample[] = [];

/** Drops samples older than the retention window. */
function prune(now: number): void {
  while (samples.length > 0 && now - samples[0].at > RETENTION_MS) {
    samples.shift();
  }
}

export function recordVitals(sample: VitalsSample): void {
  prune(sample.at);
  samples.push(sample);
  // Bounded even under a burst, because an unbounded array in a long-lived
  // process is a leak with a friendly name.
  if (samples.length > MAX_SAMPLES) samples.splice(0, samples.length - MAX_SAMPLES);
}

/** Nearest-rank percentile; avoids interpolating a number nobody observed. */
function percentile(sorted: number[], fraction: number): number | null {
  if (sorted.length === 0) return null;
  const rank = Math.ceil(fraction * sorted.length);
  return sorted[Math.min(Math.max(rank - 1, 0), sorted.length - 1)];
}

export interface VitalsSummary {
  window: string;
  count: number;
  byRoute: Array<{
    path: string;
    count: number;
    lcp: { p50: number | null; p75: number | null; p95: number | null };
    cls: { p50: number | null; p75: number | null; p95: number | null };
    ttfb: { p50: number | null; p75: number | null; p95: number | null };
    slowestEvent: number;
  }>;
}

export function summariseVitals(now = Date.now()): VitalsSummary {
  prune(now);

  const groups = new Map<string, VitalsSample[]>();
  for (const sample of samples) {
    const list = groups.get(sample.path);
    if (list) list.push(sample);
    else groups.set(sample.path, [sample]);
  }

  const byRoute = [...groups.entries()]
    .map(([path, list]) => {
      const lcp = list.map((s) => s.lcp).sort((a, b) => a - b);
      const cls = list.map((s) => s.cls).sort((a, b) => a - b);
      const ttfb = list.map((s) => s.ttfb).sort((a, b) => a - b);

      return {
        path,
        count: list.length,
        lcp: { p50: percentile(lcp, 0.5), p75: percentile(lcp, 0.75), p95: percentile(lcp, 0.95) },
        cls: { p50: percentile(cls, 0.5), p75: percentile(cls, 0.75), p95: percentile(cls, 0.95) },
        ttfb: { p50: percentile(ttfb, 0.5), p75: percentile(ttfb, 0.75), p95: percentile(ttfb, 0.95) },
        slowestEvent: Math.max(...list.map((s) => s.longestEvent)),
      };
    })
    .sort((a, b) => (b.lcp.p75 ?? 0) - (a.lcp.p75 ?? 0));

  return { window: "1h", count: samples.length, byRoute };
}
