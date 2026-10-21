/**
 * Database operations shared by operator scripts and the integration tests.
 *
 * - `runMigrations` applies the committed Drizzle migrations to a database.
 * - `applyManualSql` runs a file from `drizzle/manual/` in one call.
 *
 * The tests use these helpers on purpose: the documented command and the test
 * then exercise the same SQL and the same migration ledger.
 *
 * Every function takes an explicit connection string. Nothing here reads the
 * environment or caches a client, so it can never accidentally use the runtime
 * `DATABASE_URL`.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const CONNECTION_OPTIONS = { max: 1, onnotice: () => {} } as const;

/** Absolute path of the committed migrations folder. */
export function migrationsFolder(): string {
  return path.join(process.cwd(), "drizzle");
}

/** Reads a committed manual SQL file, rejecting path traversal. */
export async function readManualSql(fileName: string): Promise<string> {
  if (!/^[a-z0-9_-]+\.sql$/i.test(fileName)) {
    throw new Error(
      `Manual SQL file name "${fileName}" is not a plain .sql file name.`,
    );
  }

  return readFile(path.join(migrationsFolder(), "manual", fileName), "utf8");
}

/**
 * Applies `drizzle/` migrations to the given database.
 *
 * Uses Drizzle's programmatic migrator, which writes the same
 * `drizzle.__drizzle_migrations` ledger as `drizzle-kit migrate`, so a second
 * run is a no-op.
 */
export async function runMigrations(connectionString: string): Promise<void> {
  const client = postgres(connectionString, CONNECTION_OPTIONS);

  try {
    const db = drizzle(client, { casing: "snake_case" });
    await migrate(db, { migrationsFolder: migrationsFolder() });
  } finally {
    await client.end({ timeout: 5 });
  }
}

/**
 * Applies a manual SQL file (default `security.sql`) with the admin connection.
 *
 * The files are repeatable by design (SRS 19.1), so this can be run after every
 * migration that adds a table.
 */
export async function applyManualSql(
  connectionString: string,
  fileName = "security.sql",
): Promise<void> {
  const sqlText = await readManualSql(fileName);
  const client = postgres(connectionString, CONNECTION_OPTIONS);

  try {
    // `unsafe` with no parameters uses the simple query protocol, which is
    // what lets a multi-statement file including `do $$ ... $$` blocks run.
    await client.unsafe(sqlText);
  } finally {
    await client.end({ timeout: 5 });
  }
}
