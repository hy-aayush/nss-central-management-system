import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

/**
 * Sign-out (SRS 16.2 step 5).
 *
 * POST only, with an Origin check (SRS 16.3): a GET link must not be able to
 * end someone's session. The Supabase session is revoked and its HttpOnly
 * cookies are deleted on the response. The hard navigation to `/login` plus
 * `Clear-Site-Data: "cache"` prevents the back button from showing private
 * pages.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set<string>([new URL(request.url).origin]);

  if (process.env.APP_ORIGIN) {
    try {
      allowedOrigins.add(new URL(process.env.APP_ORIGIN).origin);
    } catch {
      // Ignore malformed configuration; the request origin still applies.
    }
  }

  if (!origin || !allowedOrigins.has(origin)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const client = createSupabaseRouteClient(request);
  const response = NextResponse.redirect(new URL("/login", request.url), 303);

  if (client) {
    await client.supabase.auth.signOut();
    client.apply(response);
  }

  response.headers.set("Clear-Site-Data", '"cache"');
  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate, max-age=0",
  );

  return response;
}
