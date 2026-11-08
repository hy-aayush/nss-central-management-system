"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { EMAIL_DOMAIN } from "@/config/identity";
import { getRequestOrigin } from "@/lib/platform/request-origin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  DEV_SESSION_COOKIE,
  findDevLoginAccount,
  isDevLoginEnabled,
} from "./dev-login";
import { sanitizeReturnTo } from "./return-to";

/**
 * Starts Supabase Google sign-in (SRS 16.2 step 1).
 *
 * Runs on the server: the PKCE code verifier is stored in an HttpOnly cookie
 * by `@supabase/ssr`, and the browser only receives the Google URL. The
 * `hd` query parameter is a Google hint; the server re-checks the domain,
 * verification flag and roll number in the callback.
 *
 * No email/password flow exists, and no account is created by this code: the
 * person must already exist in `volunteers` and hold an active post.
 */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = sanitizeReturnTo(formData.get("next")?.toString());
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?error=config");
  }

  const origin = await getRequestOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        hd: EMAIL_DOMAIN,
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirect("/login?error=start");
  }

  redirect(data.url);
}

/**
 * TEMPORARY development sign-in for the seeded test roster.
 *
 * Sets an HttpOnly cookie naming the roll number of a seeded test account.
 * `getSession()` reads it only while `isDevLoginEnabled()` is true, and
 * `resolveOfficeAccess()` still requires an active office post, so this grants
 * nothing on its own. Remove with the rest of the dev sign-in.
 */
export async function signInWithDevCredentials(formData: FormData): Promise<void> {
  if (!isDevLoginEnabled()) {
    redirect("/login?error=config");
  }

  const next = sanitizeReturnTo(formData.get("next")?.toString());
  const account = findDevLoginAccount(
    formData.get("username")?.toString(),
    formData.get("password")?.toString(),
  );

  if (!account) {
    redirect("/login?error=dev");
  }

  const store = await cookies();

  store.set(DEV_SESSION_COOKIE, account.rollNumber, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect(next);
}
