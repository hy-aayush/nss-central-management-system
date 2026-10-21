/**
 * Identity from verified JWT claims.
 *
 * SRS 2.4 and 4.4: the JWT signature is verified by `supabase.auth.getClaims()`
 * before this module runs. Only these claims are used, and only for identity:
 *
 * - `email` + `email_verified` — Google must have verified the address.
 * - `hd` — if Google sends the Workspace hosted-domain claim, it must match.
 * - The local part of the email is the roll number and must match
 *   `ROLL_NUMBER_PATTERN` from `src/config/identity.ts`.
 *
 * Roles, projects and every other authorization fact come from the database,
 * never from claims (SRS 2.4). Nothing here trusts `user_metadata`.
 */

import { EMAIL_DOMAIN, ROLL_NUMBER_PATTERN } from "@/config/identity";

export interface VerifiedIdentity {
  /** Lower-cased verified institutional email. */
  email: string;
  /** The email's local part; also the `volunteers.roll_number`. */
  rollNumber: string;
}

export type IdentityProblem =
  | "MISSING_EMAIL"
  | "EMAIL_UNVERIFIED"
  | "DOMAIN_NOT_ALLOWED"
  | "INVALID_ROLL_NUMBER"
  | "HOSTED_DOMAIN_MISMATCH";

export type IdentityResult =
  | { ok: true; identity: VerifiedIdentity }
  | { ok: false; problem: IdentityProblem };

/**
 * Validates the security-relevant claims. Rejection reasons are internal; the
 * access-denied page never shows them (no role/identity disclosure).
 */
export function identityFromClaims(
  claims: Record<string, unknown> | null | undefined,
): IdentityResult {
  if (!claims) {
    return { ok: false, problem: "MISSING_EMAIL" };
  }

  const emailValue = claims.email;

  if (typeof emailValue !== "string" || emailValue.trim() === "") {
    return { ok: false, problem: "MISSING_EMAIL" };
  }

  if (claims.email_verified !== true) {
    return { ok: false, problem: "EMAIL_UNVERIFIED" };
  }

  const email = emailValue.trim().toLowerCase();
  const atIndex = email.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === email.length - 1) {
    return { ok: false, problem: "MISSING_EMAIL" };
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (domain !== EMAIL_DOMAIN) {
    return { ok: false, problem: "DOMAIN_NOT_ALLOWED" };
  }

  // Google Workspace sets `hd` for hosted accounts. If it is present it must
  // agree with the email domain; a personal Google account with a spoofed
  // email cannot satisfy both.
  const hostedDomain = claims.hd;

  if (hostedDomain !== undefined && hostedDomain !== null) {
    if (
      typeof hostedDomain !== "string" ||
      hostedDomain.trim().toLowerCase() !== EMAIL_DOMAIN
    ) {
      return { ok: false, problem: "HOSTED_DOMAIN_MISMATCH" };
    }
  }

  if (!ROLL_NUMBER_PATTERN.test(localPart)) {
    return { ok: false, problem: "INVALID_ROLL_NUMBER" };
  }

  return { ok: true, identity: { email, rollNumber: localPart } };
}
