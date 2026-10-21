import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getDb } from "@/db";

import { resolveOfficeAccess, type AccessDenialReason, type OfficeAccess } from "./gate";
import { getSession } from "./session";

/**
 * The office access gate (SRS 4.4 and 16.2).
 *
 * `loadOfficeAccess` verifies the session (signature + institutional identity)
 * and then resolves access from the database. It is the single server-side
 * entry point for both questions and is deduped per request with React.cache.
 *
 * `requireOfficeAccess` is called by:
 * - the `(office)` layout and template, so private pages never render for an
 *   unauthorized visitor;
 * - future repositories/services before any private query, because a layout or
 *   proxy check alone is not authorization (SRS 16.2 item 4).
 *
 * An unauthenticated/invalid session goes to `/login`; a verified identity
 * without an active post goes through `/auth/denied`, which signs the Supabase
 * session out before showing the minimal denied page.
 */

export type OfficeAccessState =
  | { status: "unconfigured" }
  | { status: "unauthenticated" }
  | { status: "unverifiable" }
  | { status: "identity_rejected" }
  | { status: "denied"; reason: AccessDenialReason | "LOOKUP_FAILED" }
  | { status: "granted"; access: OfficeAccess };

export const loadOfficeAccess = cache(async (): Promise<OfficeAccessState> => {
  const session = await getSession();

  if (session.status !== "verified") {
    switch (session.status) {
      case "identity_rejected":
        return { status: "identity_rejected" };
      case "unconfigured":
      case "unauthenticated":
      case "unverifiable":
        return { status: session.status };
    }
  }

  try {
    const result = await resolveOfficeAccess(session.identity, getDb());

    return result.ok
      ? { status: "granted", access: result.access }
      : { status: "denied", reason: result.reason };
  } catch (error) {
    // Deny by default when the database cannot answer. No request details or
    // tokens are logged.
    console.error("Office access lookup failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return { status: "denied", reason: "LOOKUP_FAILED" };
  }
});

/** Returns the access object or redirects. Never returns for a denied caller. */
export async function requireOfficeAccess(): Promise<OfficeAccess> {
  const state = await loadOfficeAccess();

  if (state.status === "granted") {
    return state.access;
  }

  if (
    state.status === "identity_rejected" ||
    state.status === "denied"
  ) {
    redirect("/auth/denied");
  }

  redirect("/login");
}
