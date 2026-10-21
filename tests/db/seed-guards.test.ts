/**
 * Seed safety guards. No database is touched; these are pure checks of the
 * rules that keep a seed from reaching production and of the repository wiring
 * that keeps it from running automatically.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertSeedTargetAllowed,
  describeSeedTarget,
  formatSeedTarget,
} from "../../src/db/seed/targets";

const LOCAL_URL = "postgresql://postgres:secret@127.0.0.1:55432/postgres";
const LOCAL_HOSTNAME_URL = "postgresql://postgres:secret@localhost:5432/nss";
const REMOTE_URL =
  "postgresql://postgres.ref:secret@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

describe("seed target guard", () => {
  it("allows a loopback database without extra opt-in", () => {
    expect(
      assertSeedTargetAllowed({ connectionString: LOCAL_URL }),
    ).toEqual({
      host: "127.0.0.1",
      port: "55432",
      database: "postgres",
      isLocal: true,
    });

    expect(
      assertSeedTargetAllowed({ connectionString: LOCAL_HOSTNAME_URL }).port,
    ).toBe("5432");

    expect(
      assertSeedTargetAllowed({ connectionString: LOCAL_HOSTNAME_URL }).isLocal,
    ).toBe(true);
  });

  it("refuses NODE_ENV=production", () => {
    expect(() =>
      assertSeedTargetAllowed({
        connectionString: LOCAL_URL,
        nodeEnv: "production",
      }),
    ).toThrow(/NODE_ENV=production/);
  });

  it("refuses SEED_TARGET=production", () => {
    expect(() =>
      assertSeedTargetAllowed({
        connectionString: REMOTE_URL,
        seedTarget: "production",
        allowRemote: true,
      }),
    ).toThrow(/SEED_TARGET=production/);
  });

  it("refuses a remote host unless staging is declared and remote access is opted in", () => {
    expect(() =>
      assertSeedTargetAllowed({ connectionString: REMOTE_URL }),
    ).toThrow(/remote host/);

    expect(() =>
      assertSeedTargetAllowed({
        connectionString: REMOTE_URL,
        seedTarget: "staging",
      }),
    ).toThrow(/remote host/);

    expect(() =>
      assertSeedTargetAllowed({ connectionString: REMOTE_URL, allowRemote: true }),
    ).toThrow(/remote host/);
  });

  it("allows an explicitly approved staging target", () => {
    const target = assertSeedTargetAllowed({
      connectionString: REMOTE_URL,
      seedTarget: "staging",
      allowRemote: true,
    });

    expect(target.isLocal).toBe(false);
    expect(target.host).toBe("aws-0-ap-south-1.pooler.supabase.com");
  });

  it("rejects an empty or malformed URL", () => {
    expect(() => describeSeedTarget("")).toThrow(/connection string/i);
    expect(() => describeSeedTarget("not a url")).toThrow(/valid URL/);
    expect(() =>
      describeSeedTarget("https://example.com/database"),
    ).toThrow(/postgresql:\/\//);
  });

  it("never prints credentials", () => {
    const label = formatSeedTarget(describeSeedTarget(LOCAL_URL));

    expect(label).toBe("127.0.0.1:55432/postgres (local)");
    expect(label).not.toContain("secret");
    expect(label).not.toContain("postgres:secret");
  });
});

describe("seed is never automatic", () => {
  it("is not wired into any lifecycle script", async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(process.cwd(), "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    const scripts = packageJson.scripts ?? {};

    for (const name of [
      "dev",
      "build",
      "start",
      "predev",
      "prebuild",
      "postinstall",
      "prepare",
    ]) {
      expect(scripts[name] ?? "").not.toMatch(/seed/i);
    }

    // `db:seed` exists as an explicit operator command.
    expect(scripts["db:seed"]).toMatch(/seed/i);
  });
});
