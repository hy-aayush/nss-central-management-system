import { NextResponse, type NextRequest } from "next/server";

/**
 * Field-metrics intake (see `src/lib/vitals.ts`).
 *
 * Same-origin only, tiny by construction, and it stores nothing: a visit's
 * numbers are written to the server log as one line, which is enough to compare
 * a change against the previous deployment in whatever log viewer is in use.
 * Wiring this to a database is a deliberate later step — a metrics table with
 * no retention policy is a privacy liability, not an observability win.
 */

const MAX_BODY_BYTES = 2_048;

/** Clamps a metric to a sane range so a crafted beacon cannot skew logs. */
function metric(value: unknown, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(Math.max(value, 0), max);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // `sendBeacon` sends an Origin; rejecting a foreign one keeps this from being
  // used as a free log-injection endpoint.
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return new NextResponse(null, { status: 403 });
      }
    } catch {
      return new NextResponse(null, { status: 403 });
    }
  }

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return new NextResponse(null, { status: 400 });
  }

  const record = {
    path: typeof body.path === "string" ? body.path.slice(0, 120) : "/",
    lcp: metric(body.lcp, 120_000),
    cls: metric(body.cls, 10),
    longestEvent: metric(body.longestEvent, 120_000),
    ttfb: metric(body.ttfb, 120_000),
    viewport: typeof body.viewport === "string" ? body.viewport.slice(0, 20) : null,
    connection:
      typeof body.connection === "string" ? body.connection.slice(0, 12) : null,
    env: typeof body.env === "string" ? body.env.slice(0, 12) : null,
  };

  console.info(`[vitals] ${JSON.stringify(record)}`);

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}
