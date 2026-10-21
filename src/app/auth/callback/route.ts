import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@/db";
import { identityFromClaims } from "@/lib/auth/claims";
import { resolveOfficeAccess } from "@/lib/auth/gate";
import { sanitizeReturnTo } from "@/lib/auth/return-to";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

/**
 * OAuth callback (SRS 16.2 step 2).
 *
 * Exchanges the PKCE code for a session (cookies written onto the response),
 * verifies the JWT with `getClaims()`, validates the institutional identity,
 * and runs the database access gate before redirecting anywhere private.
 *
 * A verified but unapproved person is signed out here and sent to the minimal
 * access-denied page. No role, project or volunteer data is read for them.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const next = sanitizeReturnTo(url.searchParams.get("next"));
  const code = url.searchParams.get("code");

  const loginError = (reason: "callback" | "config" | "session") =>
    redirectWith(request, `/login?error=${reason}`);

  if (url.searchParams.get("error")) {
    return loginError("callback");
  }

  if (!code) {
    return loginError("callback");
  }

  const client = createSupabaseRouteClient(request);

  if (!client) {
    return loginError("config");
  }

  const { supabase, apply } = client;

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return apply(loginError("callback"));
  }

  let claims: Record<string, unknown> | null = null;

  try {
    const { data, error } = await supabase.auth.getClaims();
    claims = error || !data ? null : (data.claims as Record<string, unknown>);
  } catch {
    claims = null;
  }

  if (!claims) {
    await supabase.auth.signOut();
    return apply(loginError("session"));
  }

  const identityResult = identityFromClaims(claims);

  if (!identityResult.ok) {
    await supabase.auth.signOut();
    return apply(redirectWith(request, "/access-denied"));
  }

  let accessResult;

  try {
    accessResult = await resolveOfficeAccess(identityResult.identity, getDb());
  } catch (error) {
    console.error("Office access lookup failed during callback", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    await supabase.auth.signOut();
    return apply(redirectWith(request, "/access-denied"));
  }

  if (!accessResult.ok) {
    await supabase.auth.signOut();
    return apply(redirectWith(request, "/access-denied"));
  }

  return apply(redirectWith(request, next));
}

function redirectWith(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate, max-age=0",
  );
  return response;
}
