import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * The postgres-js client type. Kept as a derived type so we do not pin the
 * generic parameters manually when the `postgres` package changes.
 */
export type PostgresClient = ReturnType<typeof postgres>;

/**
 * The application database handle. Every repository and service should use
 * this type instead of `any` or a hand-written row shape.
 *
 * `typeof schema` is intentionally derived from the schema barrel. As tables
 * are added to `src/db/schema/index.ts`, the handle becomes fully typed with
 * no extra wiring here.
 */
export type Database = PostgresJsDatabase<typeof schema>;

/**
 * The SRS (rule 13, Section 9.4) requires every serverless instance to use the
 * Supabase Supavisor *transaction* pooler with these exact settings:
 *
 * - `prepare: false` — transaction-mode pooling cannot keep prepared
 *   statements pinned to one backend connection.
 * - `max: 1` — one connection per serverless instance; Vercel may run many
 *   instances and Supabase Free has a finite connection budget.
 *
 * The short idle timeout releases the connection quickly instead of holding a
 * pooler slot while an instance is cold. `connect_timeout` prevents a stalled
 * connection attempt from hanging a request for the platform default.
 *
 * These values must not be changed without updating `docs/DATABASE.md` and the
 * SRS. Do not add a larger pool here to "make it faster".
 */
const POOL_OPTIONS = {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
} as const;

/**
 * Creates a Drizzle handle around a postgres-js client.
 *
 * This factory deliberately takes the connection string as an argument. The
 * server-only module (`src/db/index.ts`) supplies `DATABASE_URL`; scripts and
 * tests can supply an explicit staging/local URL without loading Next.js
 * request context or accidentally reading a production credential.
 */
export function createDatabase(connectionString: string): {
  client: PostgresClient;
  db: Database;
} {
  if (!connectionString.trim()) {
    throw new Error("A non-empty PostgreSQL connection string is required.");
  }

  const client = postgres(connectionString, POOL_OPTIONS);

  const db = drizzle(client, {
    schema,
    // Keep runtime identifier mapping consistent with drizzle-kit. The SRS
    // requires snake_case DB identifiers and camelCase TS properties, so future
    // schema files can rely on this setting instead of repeating names.
    casing: "snake_case",
  });

  return { client, db };
}
