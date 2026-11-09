import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEV_SESSION_COOKIE, isDevLoginEnabled } from "@/lib/auth/dev-login";
import { readSupabaseConfig } from "@/lib/supabase/config";

/**
 * Next.js 16 Proxy (formerly middleware) — optimistic protection only.
 *
 * It answers one question: "is there a usable Supabase session?" It redirects
 * visitors without one to `/login?next=...` and refreshes rotated cookies onto
 * the response. It does **not** query the database and is never the
 * authorization decision: the `(office)` layout and template, and every future
 * data function, call `requireOfficeAccess()` (SRS 16.2 item 4).
 *
 * Refreshing the session here is deliberate. `getClaims()` in a Server
 * Component cannot write cookies, so without this the access token would be
 * re-fetched on every request after expiry. Signature verification itself is
 * still local and cached (JWKS); the database gate remains the only place that
 * decides office access.
 */

/** Only the sign-in and denial pages are public (SRS 18.5). */
const PUBLIC_PATHS = new Set(["/login", "/access-denied"]);

const AUTH_COOKIE_PATTERN = /^sb-.+-auth-token(\.\d+)?$/;

const METADATA_PATHS = new Set([
  "/opengraph-image",
  "/twitter-image",
  "/icon",
  "/apple-icon",
  "/manifest.webmanifest",
  "/robots.txt",
]);

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/auth/") ||
    pathname === "/auth" ||
    // Generated metadata files carry no private data, and crawlers that build a
    // link preview cannot hold a session. Without this the OpenGraph card would
    // answer with a login redirect.
    METADATA_PATHS.has(pathname)
  );
}

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => AUTH_COOKIE_PATTERN.test(cookie.name));
}

/**
 * Reads the access token's expiry from the stored Supabase session.
 *
 * `@supabase/ssr` stores the session as a base64url JSON array (`[0]` is the
 * access token) under the auth cookie, optionally chunked across `.0`, `.1`…
 * entries. Only the JWT payload is decoded — nothing is trusted or verified
 * here; this is purely a "do we need to talk to the auth server yet?" check.
 *
 * Returns `null` when the value cannot be read, which callers treat as "refresh
 * now" (the safe default).
 */
function readAccessTokenExpiry(request: NextRequest): number | null {
  const chunks = request.cookies
    .getAll()
    .filter((cookie) => AUTH_COOKIE_PATTERN.test(cookie.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (chunks.length === 0) {
    return null;
  }

  const raw = chunks.map((cookie) => cookie.value).join("");

  try {
    const decoded = raw.startsWith("base64-")
      ? decodeBase64Url(raw.slice("base64-".length))
      : decodeURIComponent(raw);
    const session: unknown = JSON.parse(decoded);
    const accessToken = Array.isArray(session) ? session[0] : null;

    if (typeof accessToken !== "string") {
      return null;
    }

    const payload = accessToken.split(".")[1];

    if (!payload) {
      return null;
    }

    const claims = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown };

    return typeof claims.exp === "number" ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** base64url → UTF-8 text, without depending on Node's `Buffer`. */
function decodeBase64Url(value: string): string {
  const normalised = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalised.padEnd(
    normalised.length + ((4 - (normalised.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

/**
 * How long before expiry the session is refreshed.
 *
 * Supabase's own client refreshes at roughly this margin. Refreshing earlier
 * than needed costs an auth round trip on a request that did not require one;
 * refreshing later risks serving a request with an expired token.
 */
const REFRESH_MARGIN_MS = 60_000;

function loginRedirect(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", returnTo);

  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // TEMPORARY: the seeded test accounts sign in without Supabase. The Office
  // layout still calls `requireOfficeAccess()`, which is the real decision.
  if (
    isDevLoginEnabled() &&
    request.cookies.get(DEV_SESSION_COOKIE)?.value.trim()
  ) {
    return NextResponse.next();
  }

  if (!hasSessionCookie(request)) {
    return loginRedirect(request);
  }

  const config = readSupabaseConfig();

  if (!config) {
    return loginRedirect(request);
  }

  /**
   * Fast path: the access token is still valid for a while, so there is nothing
   * to refresh and nothing to ask the auth server. Authorization stays where it
   * belongs — the office layout/page gate still verifies the JWT and resolves
   * the database assignment on every request.
   */
  const expiresAt = readAccessTokenExpiry(request);

  if (expiresAt !== null && expiresAt - Date.now() > REFRESH_MARGIN_MS) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(config.url, config.anonKey, {
    cookieOptions: {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          // Keep the request and response consistent for the rest of this
          // request, and persist rotated tokens for the browser.
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }

        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  try {
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data) {
      return loginRedirect(request);
    }
  } catch {
    // JWKS/network failure: fail closed to the login page.
    return loginRedirect(request);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
