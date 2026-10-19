import "server-only";

import { createDatabase, type Database, type PostgresClient } from "./client";

/**
 * Server-only database entry point.
 *
 * `server-only` makes Next.js fail the build if a Client Component imports this
 * module, which is the guard required by SRS Section 16.1 and rule 12. The
 * browser must never receive `DATABASE_URL` or a database handle.
 *
 * The connection is lazy: importing this module does not connect, and a missing
 * `DATABASE_URL` only throws when a server operation actually asks for a
 * handle. That keeps `next build` and tooling usable without production
 * secrets.
 */

interface CachedDatabase {
  client: PostgresClient;
  db: Database;
}

/**
 * Next.js development reloads modules frequently. Keeping the handle on
 * `globalThis` prevents a new postgres-js client (and therefore a new pooler
 * connection) from being created on every hot reload.
 *
 * In production each serverless instance has its own global scope, so this is
 * still exactly one client with `max: 1` per instance.
 */
const globalForDb = globalThis as typeof globalThis & {
  __nssDatabase?: CachedDatabase;
};

/**
 * Reads and validates the server-only application connection string.
 *
 * This must be the Supavisor transaction-pooler URL for `app_user`
 * (port 6543). It is never `NEXT_PUBLIC_*`, never imported by client code, and
 * never logged.
 */
function readDatabaseUrl(): string {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString?.trim()) {
    throw new Error(
      "DATABASE_URL is not set. Add the Supabase Supavisor transaction-pooler URL for app_user to the server environment (see .env.example).",
    );
  }

  return connectionString;
}

/**
 * Returns the typed Drizzle database handle for the current serverless
 * instance, creating it on first use.
 *
 * Repositories should call `getDb()` inside their functions. They must not
 * cache the returned handle across requests in a way that bypasses the lazy
 * environment check, and they must never pass it to a Client Component.
 */
export function getDb(): Database {
  if (!globalForDb.__nssDatabase) {
    globalForDb.__nssDatabase = createDatabase(readDatabaseUrl());
  }

  return globalForDb.__nssDatabase.db;
}

/**
 * Closes the pooled connection. Intended for tests, scripts and graceful
 * shutdown; request handlers should normally let the pooler manage the
 * connection.
 */
export async function closeDatabase(): Promise<void> {
  const cached = globalForDb.__nssDatabase;

  if (!cached) {
    return;
  }

  // Clear the cache first so a failed close cannot leave a dead handle behind.
  globalForDb.__nssDatabase = undefined;
  await cached.client.end({ timeout: 5 });
}

export type { Database } from "./client";
