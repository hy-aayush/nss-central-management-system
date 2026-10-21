import "server-only";

import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { readSupabaseConfig } from "./config";

interface PendingCookie {
  value: string;
  options: CookieOptions;
}

/**
 * Supabase client for Route Handlers (callback, sign-out).
 *
 * Route Handlers can write cookies on the outgoing response, so the adapter
 * collects every cookie write and `apply()` puts them on the `NextResponse`
 * that is actually returned. That includes refresh-token rotation, PKCE code
 * verifier cleanup and sign-out deletions.
 *
 * Every response that touched auth cookies is marked `private, no-store` so a
 * CDN can never cache one person's session response for another.
 */
export function createSupabaseRouteClient(request: NextRequest) {
  const config = readSupabaseConfig();

  if (!config) {
    return null;
  }

  const pendingCookies = new Map<string, PendingCookie>();
  const pendingHeaders = new Map<string, string>();

  const supabase = createServerClient(config.url, config.anonKey, {
    cookieOptions: {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll() {
        const merged = new Map(
          request.cookies.getAll().map((cookie) => [cookie.name, cookie.value]),
        );

        for (const [name, cookie] of pendingCookies) {
          merged.set(name, cookie.value);
        }

        return [...merged].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          pendingCookies.set(name, { value, options });
        }

        for (const [key, value] of Object.entries(headers)) {
          pendingHeaders.set(key, value);
        }
      },
    },
  });

  return {
    supabase,
    /** Writes collected cookies/headers onto the response and disables caching. */
    apply(response: NextResponse): NextResponse {
      for (const [name, cookie] of pendingCookies) {
        response.cookies.set(name, cookie.value, cookie.options);
      }

      for (const [key, value] of pendingHeaders) {
        response.headers.set(key, value);
      }

      response.headers.set(
        "Cache-Control",
        "private, no-store, no-cache, must-revalidate, max-age=0",
      );

      return response;
    },
  };
}
