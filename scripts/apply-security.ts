/**
 * Applies `drizzle/manual/security.sql` with the admin connection.
 *
 * Usage:
 *   npm run db:security
 *
 * Requires ADMIN_DATABASE_URL (see .env.example). This is the script form of
 * the documented `psql "$ADMIN_DATABASE_URL" -f drizzle/manual/security.sql`
 * command; it exists because psql is not installed on every developer machine.
 *
 * The file is repeatable: roles are created only when missing, grants are
 * idempotent, policies are dropped and recreated by name, and the SYSTEM row
 * uses ON CONFLICT DO NOTHING. Re-run it after every migration that adds a
 * table so the RLS loop and default privileges cover the new table.
 */

import { applyManualSql } from "./lib/database-ops";
import { loadDotEnv } from "./lib/env";

async function main(): Promise<void> {
  loadDotEnv();

  const connectionString = process.env.ADMIN_DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error(
      "ADMIN_DATABASE_URL is not set. Put the admin/session connection in .env (see .env.example) or export it before running npm run db:security.",
    );
  }

  await applyManualSql(connectionString, "security.sql");

  console.log(
    "Applied drizzle/manual/security.sql with the admin connection (repeatable).",
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
