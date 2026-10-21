/**
 * Proxy (Next 16 middleware) behaviour.
 *
 * The proxy is optimistic only: a missing session cookie must redirect to the
 * login page with a safe `next` value, while public pages must pass through.
 * The database gate is tested separately in `access-gate.test.ts`; the proxy is
 * never treated as the authorization decision.
 */

import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { proxy } from "../../src/proxy";

function requestFor(path: string, cookie?: string): NextRequest {
  return new NextRequest(new URL(path, "https://office.example"), {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("proxy route protection", () => {
  beforeAll(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("redirects an unauthenticated private request to login with next", async () => {
    const response = await proxy(requestFor("/dashboard"));
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(307);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/dashboard");
  });

  it("keeps the query string in the next value", async () => {
    const response = await proxy(requestFor("/volunteers?page=2"));
    const location = new URL(response.headers.get("location") ?? "");

    expect(location.searchParams.get("next")).toBe("/volunteers?page=2");
  });

  it("throws a forged cookie back to login when Supabase is unconfigured", async () => {
    const response = await proxy(
      requestFor("/dashboard", "sb-fake-auth-token=not-a-jwt"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("protects the root design page like every other private route", async () => {
    const response = await proxy(requestFor("/"));
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(307);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/");
  });

  it("passes public pages through", async () => {
    for (const path of ["/login", "/access-denied", "/auth/callback"]) {
      const response = await proxy(requestFor(path));
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
    }
  });

  it("marks login redirects as uncacheable", async () => {
    const response = await proxy(requestFor("/dashboard"));
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
});
