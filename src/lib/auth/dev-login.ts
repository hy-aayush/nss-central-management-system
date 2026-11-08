/**
 * TEMPORARY development sign-in — remove before production.
 *
 * Real authentication is Supabase Google OAuth restricted to `@kiit.ac.in`
 * (SRS 2.3 and 16.2). Until that is the only way in, the login page also
 * accepts the hardcoded test accounts in `src/db/seed/office-roster-data.ts`
 * so each office role can be exercised locally without fifteen Google accounts.
 *
 * Rules this module enforces:
 * - It is disabled whenever `NODE_ENV === "production"`, and also when
 *   `DISABLE_DEV_LOGIN=1`. There is no flag that can enable it in production.
 * - The credential list is the seeded test roster, so a dev session can only
 *   ever resolve to a roll number that also has a seeded volunteer row and an
 *   active post. Access is still decided by `resolveOfficeAccess`.
 * - The cookie is HttpOnly and holds only the roll number. It is not a JWT and
 *   must never be treated as one.
 *
 * Everything here disappears when the Google flow is final.
 */

import { cookies } from "next/headers";

import { EMAIL_DOMAIN } from "@/config/identity";
import {
  TEST_LOGIN_ACCOUNTS,
  type TestLoginAccount,
} from "@/db/seed/office-roster-data";

import type { VerifiedIdentity } from "./claims";

/** Cookie that carries the roll number of a dev-signed-in test account. */
export const DEV_SESSION_COOKIE = "nss_dev_test_session";

/**
 * Whether the temporary sign-in is available at all.
 *
 * Production is refused unconditionally; `DISABLE_DEV_LOGIN=1` turns it off in
 * development as well.
 */
export function isDevLoginEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DISABLE_DEV_LOGIN !== "1"
  );
}

/** The temporary accounts, for rendering the login helper list. */
export function devLoginAccounts(): readonly TestLoginAccount[] {
  return isDevLoginEnabled() ? TEST_LOGIN_ACCOUNTS : [];
}

/**
 * Resolves a username/password pair to a test account.
 *
 * Compares both fields in full; there is no timing-safe comparison here because
 * these are public, hardcoded development credentials, not secrets.
 */
export function findDevLoginAccount(
  username: string | undefined,
  password: string | undefined,
): TestLoginAccount | null {
  if (!isDevLoginEnabled()) {
    return null;
  }

  const user = username?.trim() ?? "";
  const pass = password ?? "";

  if (!user || !pass) {
    return null;
  }

  return (
    TEST_LOGIN_ACCOUNTS.find(
      (account) => account.username === user && account.password === pass,
    ) ?? null
  );
}

/**
 * The dev session identity for this request, if any.
 *
 * Returns `null` when the feature is off, the cookie is absent, or the cookie
 * names a roll number that is not one of the seeded test accounts. That last
 * check means a hand-written cookie cannot invent an arbitrary identity.
 */
export async function readDevSession(): Promise<VerifiedIdentity | null> {
  if (!isDevLoginEnabled()) {
    return null;
  }

  const store = await cookies();
  const raw = store.get(DEV_SESSION_COOKIE)?.value?.trim();

  if (!raw) {
    return null;
  }

  const account = TEST_LOGIN_ACCOUNTS.find(
    (candidate) => candidate.rollNumber === raw,
  );

  if (!account) {
    return null;
  }

  return {
    email: `${account.rollNumber}@${EMAIL_DOMAIN}`,
    rollNumber: account.rollNumber,
  };
}
