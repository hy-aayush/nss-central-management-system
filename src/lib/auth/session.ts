import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  identityFromClaims,
  type IdentityProblem,
  type VerifiedIdentity,
} from "./claims";

/**
 * The verified identity for the current request.
 *
 * - `unconfigured` — Supabase env is absent/invalid; sign-in cannot start.
 * - `unauthenticated` — no session cookie or no session.
 * - `unverifiable` — `getClaims()` could not validate a signature.
 * - `identity_rejected` — signature valid, but the identity is not an
 *   approved institutional account.
 * - `verified` — identity is trustworthy. Database access is decided
 *   separately by `resolveOfficeAccess`.
 *
 * The JWT is verified locally by `getClaims()` (asymmetric signing keys use a
 * cached JWKS; symmetric projects verify with the Auth server). `getSession()`
 * is never used on the server, per SRS 2.4. `React.cache` dedupes the work
 * within one request only.
 */
export type SessionState =
  | { status: "unconfigured" }
  | { status: "unauthenticated" }
  | { status: "unverifiable" }
  | { status: "identity_rejected"; problem: IdentityProblem }
  | { status: "verified"; identity: VerifiedIdentity };

export const getSession = cache(async (): Promise<SessionState> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { status: "unconfigured" };
  }

  let claims: Record<string, unknown> | null = null;

  try {
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data) {
      return { status: error ? "unverifiable" : "unauthenticated" };
    }

    claims = data.claims as Record<string, unknown>;
  } catch {
    // Network/JWKS/WebCrypto failure: deny by default, never trust the cookie.
    return { status: "unverifiable" };
  }

  const result = identityFromClaims(claims);

  if (!result.ok) {
    return { status: "identity_rejected", problem: result.problem };
  }

  return { status: "verified", identity: result.identity };
});
