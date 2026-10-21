import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/auth/") ||
    pathname === "/auth"
  );
}

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => AUTH_COOKIE_PATTERN.test(cookie.name));
}

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

  if (!hasSessionCookie(request)) {
    return loginRedirect(request);
  }

  const config = readSupabaseConfig();

  if (!config) {
    return loginRedirect(request);
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
