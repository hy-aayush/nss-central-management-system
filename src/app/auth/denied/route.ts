import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

/**
 * Gate denial cleanup (SRS 4.4).
 *
 * Reached only from `requireOfficeAccess` when a verified identity fails the
 * database gate. It revokes and deletes the Supabase session, then shows the
 * minimal access-denied page. No role, reason or volunteer detail is passed
 * along — the page is the same for every denial.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const client = createSupabaseRouteClient(request);
  const response = NextResponse.redirect(
    new URL("/access-denied", request.url),
  );

  if (client) {
    try {
      await client.supabase.auth.signOut();
      client.apply(response);
    } catch {
      // Even if the Auth server is unreachable, the redirect still denies
      // access; the stale cookie cannot pass the gate on the next request.
    }
  }

  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate, max-age=0",
  );

  return response;
}
