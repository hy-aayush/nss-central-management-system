/**
 * Identity from verified claims (SRS 4.4 steps 1 and 2).
 *
 * These tests cover the rules that run *after* the JWT signature is verified.
 * The signature itself is verified by `supabase.auth.getClaims()`; no test
 * here pretends a forged token would be accepted.
 */

import { describe, expect, it } from "vitest";

import { identityFromClaims } from "../../src/lib/auth/claims";

describe("identity from verified claims", () => {
  it("accepts a verified institutional email", () => {
    expect(
      identityFromClaims({
        email: "24051698@kiit.ac.in",
        email_verified: true,
      }),
    ).toEqual({
      ok: true,
      identity: {
        email: "24051698@kiit.ac.in",
        rollNumber: "24051698",
      },
    });
  });

  it("normalizes case in the email", () => {
    expect(
      identityFromClaims({
        email: "24051698@KIIT.AC.IN",
        email_verified: true,
      }),
    ).toEqual({
      ok: true,
      identity: {
        email: "24051698@kiit.ac.in",
        rollNumber: "24051698",
      },
    });
  });

  it("accepts a matching Google Workspace hosted-domain claim", () => {
    const result = identityFromClaims({
      email: "23053452@kiit.ac.in",
      email_verified: true,
      hd: "kiit.ac.in",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects a missing email", () => {
    expect(identityFromClaims({ email_verified: true })).toEqual({
      ok: false,
      problem: "MISSING_EMAIL",
    });

    expect(identityFromClaims(null)).toEqual({
      ok: false,
      problem: "MISSING_EMAIL",
    });
  });

  it("rejects an unverified email", () => {
    expect(
      identityFromClaims({ email: "24051698@kiit.ac.in" }),
    ).toEqual({ ok: false, problem: "EMAIL_UNVERIFIED" });

    expect(
      identityFromClaims({
        email: "24051698@kiit.ac.in",
        email_verified: false,
      }),
    ).toEqual({ ok: false, problem: "EMAIL_UNVERIFIED" });

    expect(
      identityFromClaims({
        email: "24051698@kiit.ac.in",
        email_verified: "true",
      }),
    ).toEqual({ ok: false, problem: "EMAIL_UNVERIFIED" });
  });

  it("rejects a non-institutional domain", () => {
    expect(
      identityFromClaims({
        email: "someone@gmail.com",
        email_verified: true,
      }),
    ).toEqual({ ok: false, problem: "DOMAIN_NOT_ALLOWED" });

    expect(
      identityFromClaims({
        email: "24051698@kiit.ac.in.evil.example",
        email_verified: true,
      }),
    ).toEqual({ ok: false, problem: "DOMAIN_NOT_ALLOWED" });
  });

  it("rejects a local part that is not a roll number", () => {
    for (const local of ["staff", "2405", "24051698x", "24-051698"]) {
      expect(
        identityFromClaims({
          email: `${local}@kiit.ac.in`,
          email_verified: true,
        }),
      ).toEqual({ ok: false, problem: "INVALID_ROLL_NUMBER" });
    }
  });

  it("rejects a Workspace hosted-domain claim that disagrees", () => {
    expect(
      identityFromClaims({
        email: "24051698@kiit.ac.in",
        email_verified: true,
        hd: "gmail.com",
      }),
    ).toEqual({ ok: false, problem: "HOSTED_DOMAIN_MISMATCH" });
  });

  it("never trusts a role claim", () => {
    const result = identityFromClaims({
      email: "24051698@kiit.ac.in",
      email_verified: true,
      role: "COORDINATOR",
      user_metadata: { role: "COORDINATOR" },
    });

    // Identity passes; roles are not part of this result at all.
    expect(result.ok).toBe(true);
    expect(Object.keys(result)).toEqual(["ok", "identity"]);
  });
});
