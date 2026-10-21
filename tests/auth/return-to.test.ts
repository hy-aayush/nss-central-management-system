import { describe, expect, it } from "vitest";

import {
  DEFAULT_RETURN_TO,
  sanitizeReturnTo,
} from "../../src/lib/auth/return-to";

describe("safe return URLs", () => {
  it("keeps an internal path and its query string", () => {
    expect(sanitizeReturnTo("/volunteers")).toBe("/volunteers");
    expect(sanitizeReturnTo("/volunteers?page=2&q=2405")).toBe(
      "/volunteers?page=2&q=2405",
    );
    expect(sanitizeReturnTo("  /events/central/new  ")).toBe(
      "/events/central/new",
    );
  });

  it("rejects absolute, protocol-relative and scheme URLs", () => {
    for (const value of [
      "https://evil.example/phish",
      "http://evil.example",
      "//evil.example",
      "///evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "data:text/html,hi",
      "mailto:a@b.c",
    ]) {
      expect(sanitizeReturnTo(value)).toBe(DEFAULT_RETURN_TO);
    }
  });

  it("rejects auth and access pages to avoid redirect loops", () => {
    for (const value of [
      "/login",
      "/login?next=/dashboard",
      "/access-denied",
      "/auth/callback",
      "/auth/signout",
    ]) {
      expect(sanitizeReturnTo(value)).toBe(DEFAULT_RETURN_TO);
    }
  });

  it("rejects empty, non-string, control and overlong values", () => {
    expect(sanitizeReturnTo(undefined)).toBe(DEFAULT_RETURN_TO);
    expect(sanitizeReturnTo(null)).toBe(DEFAULT_RETURN_TO);
    expect(sanitizeReturnTo("")).toBe(DEFAULT_RETURN_TO);
    expect(sanitizeReturnTo(["/dashboard", "/other"])).toBe(DEFAULT_RETURN_TO);
    expect(sanitizeReturnTo("/dash\u0000board")).toBe(DEFAULT_RETURN_TO);
    expect(sanitizeReturnTo(`/${"a".repeat(600)}`)).toBe(DEFAULT_RETURN_TO);
  });

  it("drops fragments, which never reach the server path", () => {
    expect(sanitizeReturnTo("/dashboard#section")).toBe("/dashboard");
  });
});
