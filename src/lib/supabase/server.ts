import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { readSupabaseConfig } from "./config";

/**
 * Per-request Supabase client for Server Components and Server Actions.
 *
 * The session always comes from the request cookies; `@supabase/ssr` stores it
 * in `HttpOnly`, `Secure` (in production), `SameSite=Lax` cookies. Never cache
 * this client across requests.
 *
 * `setAll` can fail inside a Server Component (React does not allow mutating
 * response cookies during render). The failure is swallowed there and the
 * proxy is responsible for refreshing the session cookies, as the Supabase SSR
 * guidance requires. Route Handlers use `createSupabaseRouteClient` instead,
 * which writes cookies onto the real response.
 */
export async function createSupabaseServerClient() {
  const config = readSupabaseConfig();

  if (!config) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookieOptions: {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component render: the proxy refreshes the cookies instead.
        }
      },
    },
  });
}
