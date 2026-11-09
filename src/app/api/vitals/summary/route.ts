import { NextResponse } from "next/server";

import { summariseVitals } from "@/lib/vitals-store";

/**
 * Percentiles over the last hour of beacons, per route.
 *
 * Private and uncached: this is operational data about the deployment, it is
 * per-instance (see `src/lib/vitals-store.ts`), and a cached copy would report
 * numbers that are no longer true. The access gate in `src/proxy.ts` already
 * requires an office session for `/api/*`, so this is not a public surface.
 */
export function GET(): NextResponse {
  return NextResponse.json(summariseVitals(), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
